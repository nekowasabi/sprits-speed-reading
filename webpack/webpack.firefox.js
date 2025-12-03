const { mergeWithCustomize, customizeArray } = require('webpack-merge');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const commonConfig = require('./webpack.common');
const { version } = require('../package.json');

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
  ],
});
