const path = require("path")
const webpack = require("webpack")

const HTMLPlugin = require("html-webpack-plugin")
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')

const isProduction = process.env.NODE_ENV === "PRODUCTION"

let webpackConfig = {
  devtool: isProduction
    ? false
    : "inline-source-map",
  devServer: {
    contentBase: path.resolve(__dirname, "./dist"),
    compress: true,
    port: 9000,
    hot: true,
    inline: true
  },
  entry: {
    app: "./src/index.js"
  },
  output: {
		path: path.resolve(__dirname, "./dist"),
		filename: "js/[name].[hash:16].js"
  },
  resolve: {
		alias: {
			"static": path.resolve(__dirname, "./static"),
			"src": path.resolve(__dirname, "./src"),
			"styles": path.resolve(__dirname, "./src/styles"),
		},
    extensions: ['.js', '.scss', '.css']
  },
  module: {
    rules: [
			{
				test: /\.js$/,
				loader: "babel-loader",
				exclude: /node_modules/
			},
			{
				test: /\.(png|jpe?g|gif|svg|ico)(\?.*)?$/,
				loader: "url-loader",
				options: {
					limit: 10000,
					name: "img/[name].[hash:16].[ext]"
				}
			},
			{
				test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
				loader: "url-loader?limit=10000"
      },
      {
        test: /\.(scss|css|sass)$/,
        use: [
          {
            loader: "style-loader"
          }, {
            loader: "css-loader"
          }, {
            loader: "sass-loader"
          }
        ]
      },
      {
        test: /\.html$/,
        loader: "raw-loader"
      }
    ]
  },
  performance: {
		maxEntrypointSize: 250000,
		hints: isProduction ? "warning" : false
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "PRODUCTION": isProduction
    }),
    new HTMLPlugin({
			template: "src/index.template.html"
    }),
    new HtmlWebpackHarddiskPlugin({
      alwaysWriteToDisk: true
    })
  ]
}

if (isProduction) {
	webpackConfig.plugins.push(
		// minify JS
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
    }),
    // extract vendor chunks for better caching
		// https://github.com/Narkoleptika/webpack-everything/commit/b7902f60806cf40b9d1abf8d6bb2a094d924fff7
    new webpack.optimize.CommonsChunkPlugin({
			name: "vendor",
			minChunks: function(module) {
				return module.context && module.context.indexOf("node_modules") !== -1
			}
		}),
		// any other webpack js goes here
		new webpack.optimize.CommonsChunkPlugin({
			name: "manifest"
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  )
}

module.exports = webpackConfig
