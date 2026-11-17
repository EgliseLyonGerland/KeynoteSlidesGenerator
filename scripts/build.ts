import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import {
  BannerPlugin,
  type Configuration,
  DefinePlugin,
  EnvironmentPlugin,
  ProvidePlugin,
  webpack,
} from 'webpack';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { version } from '../package.json';

const argv = yargs(hideBin(process.argv))
  .option('slide', { alias: 's', type: 'number' })
  .option('from', { alias: 'f', type: 'number' })
  .option('to', { alias: 't', type: 'number' })
  .option('run', { type: 'boolean', default: false })
  .option('entry', { type: 'string', implies: 'run' })
  .parseSync();

const rootPath = resolve(__dirname, `..`);
const distPath = resolve(`${rootPath}/dist`);

const webpackConfig: Configuration = {
  mode: 'development',
  devtool: 'source-map',
  entry: `${rootPath}/src/index.js`,
  output: {
    path: distPath,
    filename: 'index.jxa',
    library: { name: 'SlidesGenerator', type: 'var' },
  },
  resolve: {
    extensions: ['.ts', '.js'],
    extensionAlias: {
      '.js': ['.js', '.ts'],
    },
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|ts)$/,
        loader: require.resolve('source-map-loader'),
      },
      {
        test: /\.(ts)$/,
        loader: 'ts-loader',
        options: { onlyCompileBundledFiles: true },
      },
    ],
  },
  plugins: [
    new BannerPlugin({
      banner: 'function run(argv) { return SlidesGenerator.run(argv); }',
      raw: true,
      footer: true,
    }),
    new EnvironmentPlugin({
      OPTIONS: JSON.stringify({
        slide: argv.slide || argv.s,
        from: argv.from || argv.f,
        to: argv.to || argv.t,
      }),
    }),
    new ProvidePlugin({
      'debug': [`${rootPath}/src/utils/debug`, 'debug'],
      'console.log': [`${rootPath}/src/utils/debug`, 'debug'],
      'debugElements': [`${rootPath}/src/utils/debugElements`, 'debugElements'],
    }),
    new DefinePlugin({
      'process.env': '{}',
    }),
  ],
};

async function exec(cmd: string, args: string[]) {
  return await new Promise<void>((done, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code, signal) => {
      if (code !== 0) {
        reject(new Error(`${cmd} failed (${signal || `exit code ${code}`})`));
        return;
      }
      done();
    });
  });
}

async function main() {
  await new Promise<void>((done, reject) => {
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        reject(err);
        return;
      }
      if (!stats || stats.hasErrors()) {
        reject(new Error(stats ? stats.toString({ colors: false }) : 'Webpack returned no build result'));
        return;
      }
      console.log(stats.toString({ colors: process.stdout.isTTY }));
      done();
    });
  });

  const appPath = resolve(distPath, 'KeynoteSlidesGenerator.app');
  await exec('osacompile', [
    '-l',
    'JavaScript',
    '-o',
    appPath,
    `${distPath}/index.jxa`,
  ]);
  const infoPath = resolve(appPath, 'Contents/Info.plist');
  for (const key of ['CFBundleShortVersionString', 'CFBundleVersion']) {
    await exec('plutil', ['-replace', key, '-string', version, infoPath]);
  }
  // Updating the bundle metadata invalidates osacompile's ad-hoc signature.
  await exec('codesign', ['--force', '--sign', '-', appPath]);
  if (argv.run) {
    const args = argv.entry ? [resolve(argv.entry)] : [];
    await exec('osascript', ['-l', 'JavaScript', appPath, ...args]);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
