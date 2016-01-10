var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
  template: __dirname + '/src/index.html',
  hash: true,
  filename: 'index.html',
  inject: 'body'
});
var HotReloader = new webpack.HotModuleReplacementPlugin();

module.exports = {
  entry: [
    './src/js/app.js'
  ],
  output: {
    path: 'public',
    filename: 'index_bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        include: __dirname + '/src'
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
      { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' }
    ]
  },
  plugins: [HTMLWebpackPluginConfig],
  devServer: {
    contentBase: __dirname + '/public',
    hot: true,
  }
};
