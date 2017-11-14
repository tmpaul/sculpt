var path = require("path");
var webpack = require("webpack");
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  devtool: "eval",
  entry: [
    "webpack-dev-server/client?http://localhost:3010",
    "webpack/hot/only-dev-server",
    path.join(__dirname, "src/app/App.jsx")
  ],
  resolve: {
    // When requiring, you don't need to add these extensions
    extensions: [ "", ".js", ".jsx" ],
    root: [ path.resolve(__dirname, "src") ],
    alias: {
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react-router": path.resolve(__dirname, "node_modules/react-router")
    },
    modulesDirectories: [
      "web_modules",
      "node_modules"
    ]
  },
  output: {
    path: path.join(__dirname, "docs"),
    filename: "main.js",
    publicPath: "/"
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      template: path.join(__dirname, "/public/index.html")
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: "style-loader!css-loader?modules=true&localIdentName=[name]__[local]__[hash:base64:5]"
      },
      { test: /\.(png|jpg|jpeg|gif)?$/, loader: "file" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml" },
      { test: /\.less$/, loader: "style!css!less" },
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
      {
        test: /\.(js)$/,
        loaders: [ "babel" ],
        include: [ path.resolve(__dirname, "../src"), path.join(__dirname, "src") ],
        exclude: path.resolve(__dirname, "../src/node_modules")
      },
      {
        test: /\.(jsx)$/,
        loaders: [ "babel" ],
        include: [ path.resolve(__dirname, "../src"), path.join(__dirname, "src") ],
        exclude: path.resolve(__dirname, "../src/node_modules")
      },
      { test: /\.json$/, loader: "json-loader" }
    ]
  }
};
