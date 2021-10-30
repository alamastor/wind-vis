const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: './src/index.tsx',
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: [
      '.ts',
      '.tsx',
      '.js',
      '.json',
      '.png',
      '.svg',
      '.jpg',
      '.gif',
      '.vert',
      '.frag',
    ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: '/node_modules/',
        loader: 'ts-loader',
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: '/node_modules/',
        loader: 'source-map-loader',
      },
      {
        exclude: '/node_modules/',
        test: /\.(png|svg|jpg|gif)$/,
        type: 'asset/resource',
      },
      {
        test: /\.css$/,
        exclude: '/node_modules/',
        use: ['style-loader', 'css-loader'],
      },
      {
        enforce: 'pre',
        exclude: '/node_modules/',
        test: /\.(vert|frag)$/,
        use: 'raw-loader',
      },
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Zephrly',
      template: 'src/index.html',
    }),
    // https://github.com/moment/moment/issues/2373
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};
