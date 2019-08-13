const path = require('path');
const webpack = require('webpack');

const rootPath = path.join(__dirname, '../..');

module.exports = {
  mode: 'development',
  devtool: false,
  entry: path.join(rootPath, '/src/index.js'),
  output: {
    path: path.join(rootPath, '/dist'),
    filename: 'index.jxa',
  },
  module: {
    rules: [
      {
        test: /\.song$/,
        use: `${__dirname}/song-loader`,
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      debug: [`${__dirname}/../../src/utils/debug`, 'debug'],
      debugElements: [
        `${__dirname}/../../src/utils/debugElements`,
        'debugElements',
      ],
    }),
  ],
};
