const webpack = require('webpack');
const path = require('path');
const env = require('rear-core/get-rear-env')();
const appPaths = require('./app-paths');
const appPackageJson = require('rear-core/get-package-json')();

const target = env.REAR_SYSTEM_PACKAGE_TARGET || 'node';
const filename = env.REAR_SYSTEM_PACKAGE_FILENAME || `${appPackageJson.name}.js` || '[name].js';
const entry = [appPaths.indexJs];

let node = { __filename: false, __dirname: false };
let exclude = /node_modules/;
let plugins = [];
if (target !== 'node') {
  entry.unshift(require.resolve('./polyfills'));
  node = {
    fs: 'empty',
    net: 'empty',
    dgram: 'empty',
    dns: 'empty',
    tls: 'empty'
  }
  exclude = undefined;
  plugins = [
    // Minify the code.
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        // Disabled because of an issue with Uglify breaking seemingly valid code:
        // https://github.com/facebookincubator/create-react-app/issues/2376
        // Pending further investigation:
        // https://github.com/mishoo/UglifyJS2/issues/2011
        comparisons: false,
      },
      output: {
        comments: false,
        // Turned on because emoji and regex is not minified properly using default
        // https://github.com/facebookincubator/create-react-app/issues/2488
        ascii_only: true,
      }
    })
  ];
}

module.exports = {
  // do not attempt to continue if errors are found
  bail: true,
  target,
  entry,
  output: {
    filename,
    path: appPaths.dest
  },
  resolve: {
    modules: ['node_modules', appPaths.appNodeModules],
    extensions: ['.web.js', '.js', '.json'],
    alias: {
      'babel-runtime': path.dirname(
        require.resolve('babel-runtime/package.json')
      ),
    },
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.(js)$/,
        enforce: 'pre',
        use: [
          {
            options: {
              eslintPath: require.resolve('eslint'),
              baseConfig: {
                extends: [require.resolve('eslint-config-rear')],
              },
              ignore: false,
              useEslintrc: false,
            },
            loader: require.resolve('eslint-loader'),
          },
        ],
        include: appPaths.root,
      },
      {
        oneOf: [
          // Process JS with Babel.
        {
          test: /\.(js)$/,
          include: appPaths.root,
          exclude,
          loader: require.resolve('babel-loader'),
          options: {
              babelrc: false,
              presets: [require.resolve('babel-preset-rear')],
              compact: true
            },
          },
        ]
      }
    ]
  },
  plugins,
  node
};
