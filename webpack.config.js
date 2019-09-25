var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const HappyPack = require('happypack');
const {
  BundleAnalyzerPlugin,
} = require('webpack-bundle-analyzer');

process.noDeprecation = true;
const isBuild = ('loc' !== '' + process.env.ENV)
var plugins = [
  new ProgressBarPlugin(),
  new HappyPack({
    id: 'jsx',
    threads: 4,
    cache: true,
    loaders: [
      {
        loader: 'babel-loader',
      }
    ]
  }),
  new CopyWebpackPlugin([
    { from: path.resolve(__dirname, './src/assets'), to: 'assets', ignore: ['.*'] },
  ])
]

if (isBuild) {
  plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'static' }))
} else {
  plugins.push(
    new webpack.HotModuleReplacementPlugin(),
  )
}

module.exports = {
  mode: isBuild ? 'production' : 'development',
  entry: {
    minimap: './src/index.js'
  },
  output: {
    filename: isBuild ? '[name].min.js' : '[name].js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    // libraryTarget: 'commonjs2',
    libraryTarget: 'umd',
    library:'minimap',
    globalObject: "typeof self !== 'undefined' ? self : this",
    chunkFilename: isBuild ? '[name].min.js' : '[name].js',
  },
  devtool: isBuild ? false : 'cheap-module-source-map',
  performance: {
    hints: isBuild ? 'warning' : false,
  },
  plugins,
  resolve: {
    alias: {
      utils: path.join(__dirname, 'src/utils'),
      assets: path.join(__dirname, 'src/assets'),
      minimap: path.join(__dirname, 'src/minimap')
    },
    modules: [path.join(__dirname, 'src'), 'node_modules'],
    extensions: [".js", ".jsx", '.less', '.css']
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'happypack/loader?id=jsx',
        include: path.join(__dirname, 'src'),
        exclude: /(node_modules)/
      }
    ]
  },
  devServer: { // webpack-dev-server配置热更新以及跨域
    historyApiFallback: true, //不跳转
    noInfo: true,
    inline: true, // 实时刷新
    port: '3009', // 不指定固定端口
    hot: true,
    open: true
  },
};
