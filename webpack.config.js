const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const glob = require("glob");
const path = require("path");

module.exports = {
  entry: glob.sync("./src/**/*_test.ts"),
  output: {
    filename: "bundle.js",
    path: __dirname + "/out"
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    alias: {
      'grapevine': path.resolve('./node_modules/grapevine'),
      'gs-tools': path.resolve('./node_modules/gs-tools'),
      'rxjs': path.resolve('./node_modules/rxjs'),
      'tslib': path.resolve('./node_modules/tslib'),
    },
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json", ".html"]
  },

  module: {
    rules: [
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      // { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
      { test: /\.tsx?$/, loader: "awesome-typescript-loader"},
    ]
  },

  mode: "development",

  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {
    "jasmine": "jasmine"
  },

  watch: true,

  plugins: [
    // new UglifyJsPlugin({
    //   uglifyOptions: {
    //     keep_classnames: true,
    //     keep_fnames: true,
    //     mangle: false,
    //   },
    //   sourceMap: true,
    // }),
  ]
};
