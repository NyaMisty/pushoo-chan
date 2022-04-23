const path = require("path");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require("webpack")

module.exports = {
  target: 'webworker',
  entry: './src/starter/cf-workers.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: {
      // disable too big encoding in http-encoding
      "zstd-codec": false,
      "brotli-wasm": false,
    },
    fallback: {
      "path": require.resolve("path-browserify"),
      "buffer": require.resolve("buffer/"),

      // "zstd-codec": false,
      // "brotli-wasm": false,
      // crypto: require.resolve('crypto-browserify'),
      assert: require.resolve('assert/'),
      
      zlib: require.resolve('browserify-zlib'),
      stream: require.resolve('stream-browserify'),
      
      util: require.resolve('util/'),
      
      fs: false
    },
    plugins: [new TsconfigPathsPlugin({})],
    extensions: ['.ts', '.tsx', '.js', '...'],
  },
  plugins: [
    new webpack.ProvidePlugin({
        process: 'process/browser.js',
        Buffer: ['buffer', 'Buffer'],
    }),
  ],
  experiments: {
    asyncWebAssembly: true
  },
  optimization: {
      minimize: false
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  mode: 'production',
};