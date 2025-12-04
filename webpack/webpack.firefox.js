const { mergeWithCustomize, customizeArray } = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const commonConfig = require('./webpack.common');
const { version } = require('../package.json');

// Use 'replace' strategy for plugins to completely override common config plugins
module.exports = mergeWithCustomize({
  customizeArray: customizeArray({
    plugins: 'replace',
  }),
})(commonConfig, {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, '../dist-firefox'),
  },
  plugins: [
    // DefinePlugin (same as common)
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    }),
    // Firefox: Use manifest.v2.json with background.scripts (not service_worker)
    new CopyPlugin({
      patterns: [
        {
          from: 'public/manifest.v2.json',
          to: 'manifest.json',
          transform(content) {
            const manifest = JSON.parse(content.toString());
            manifest.version = version;
            return JSON.stringify(manifest, null, 2);
          },
        },
        {
          from: 'icons',
          to: 'icons',
        },
      ],
    }),
    // HtmlWebpackPlugin for options.html
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/options.html'),
      filename: 'options.html',
      chunks: ['options'],
    }),
  ],
});
