var path = require("path");
var webpack = require("webpack");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: [
    path.join(__dirname, "src/app/App.jsx")
  ],
  resolve: {
    // When requiring, you don't need to add these extensions
    extensions: [ "", ".js", ".jsx" ],
    root: [ path.resolve(__dirname, "src") ],
    alias: {
      "react": path.resolve(__dirname, "node_modules/react/dist/react.min.js"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom/dist/react-dom.min.js"),
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
      template: path.join(__dirname, "/docs/index.html")
    }),
    new UglifyJSPlugin({
      sourceMap: false,
      uglifyOptions: {
        output: {
          comments: false
        }
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
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
