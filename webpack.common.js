const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.png', '.svg', '.jpg', '.gif'],
  },
  module: {
    rules: [
      {test: /\.tsx?$/, loader: 'awesome-typescript-loader'},
      {enforce: 'pre', test: /\.js$/, loader: 'source-map-loader'},
      {enforce: 'pre', test: /\.(png|svg|jpg|gif)$/, loader: 'file-loader'},
    ],
  },
};
