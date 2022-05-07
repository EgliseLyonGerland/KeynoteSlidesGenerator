const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  devtool: false,
  entry: path.join(__dirname, '/src/index.js'),
  output: {
    path: path.join(__dirname, '/dist'),
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
    new webpack.ProvidePlugin({
      debug: [`${__dirname}/src/utils/debug`, 'debug'],
      debugElements: [`${__dirname}/src/utils/debugElements`, 'debugElements'],
    }),
  ],
};
