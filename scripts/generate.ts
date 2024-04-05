import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import {
  type Configuration,
  DefinePlugin,
  EnvironmentPlugin,
  ProvidePlugin,
  webpack,
} from 'webpack';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .option('slide', { alias: 's', type: 'number' })
  .option('from', { alias: 'f', type: 'number' })
  .option('to', { alias: 't', type: 'number' })
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
      },
    ],
  },
  plugins: [
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

async function exec(cmd: string, args?: string[]) {
  return await new Promise((done) => {
    const child = spawn(cmd, args);

    child.stdout.on('data', (data) => {
      console.log(data.toString().trim());
    });

    child.stderr.on('data', (data) => {
      console.error(data.toString().trim());
    });

    child.on('exit', done);
  });
}

webpack(webpackConfig, async (err) => {
  if (err) {
    throw err;
  }

  await exec('osacompile', [
    '-l',
    'JavaScript',
    '-o',
    `${distPath}/index.app`,
    `${distPath}/index.jxa`,
  ]);
  await exec('osascript', ['-l', 'JavaScript', `${distPath}/index.app`, '-i']);
});
