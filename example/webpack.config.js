const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = () => {
  return {
    entry: './index.js',
    output: {},
    devServer: {
      host: '0.0.0.0',
      historyFallback: true,
      hot: true,
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'index.html'),
        chunksSortMode: 'manual',
      }),
    ],
  };
};
