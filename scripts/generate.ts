/* eslint-disable no-console */

import { spawn } from 'child_process';
import { resolve } from 'path';
import { Configuration, ProvidePlugin, webpack } from 'webpack';

const rootPath = resolve(`${__dirname}/..`);
const distPath = resolve(`${rootPath}/dist`);

const webpackConfig: Configuration = {
  mode: 'development',
  devtool: false,
  entry: `${rootPath}/src/index.js`,
  output: {
    path: distPath,
    filename: 'index.jxa',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new ProvidePlugin({
      debug: [`${rootPath}/src/utils/debug`, 'debug'],
      debugElements: [`${rootPath}/src/utils/debugElements`, 'debugElements'],
    }),
  ],
};

function exec(cmd: string, args?: string[]) {
  return new Promise((done) => {
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
    `${distPath}/index.scpt`,
    `${distPath}/index.jxa`,
  ]);
  await exec('osascript', ['-l', 'JavaScript', `${distPath}/index.scpt`]);
});
