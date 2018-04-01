const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    app: './src/index.tsx',
    //vectorRenderer: './src/components/VectorRenderer/index.tsx',
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.png', '.svg', '.jpg', '.gif'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: '/node_modules/',
        loader: 'awesome-typescript-loader',
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: '/node_modules/',
        loader: 'source-map-loader',
      },
      {
        enforce: 'pre',
        exclude: '/node_modules/',
        test: /\.(png|svg|jpg|gif)$/,
        loader: 'file-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Zephrly',
      template: 'src/index.html',
    }),
    new CleanWebpackPlugin(['dist']),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};
