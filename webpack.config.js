const path = require("path");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

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
    fallback: {
      "path": require.resolve("path-browserify"),
      "buffer": require.resolve("buffer"),
    },
    plugins: [new TsconfigPathsPlugin({})],
    extensions: ['.ts', '.tsx', '.js', '...'],
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