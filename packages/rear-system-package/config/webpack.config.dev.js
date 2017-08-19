const path = require('path');
const env = require('rear-core/get-rear-env')();
const appPaths = require('./app-paths');

module.exports = {
  // do not attempt to continue if errors are found
  bail: true,
  target: env.REAR_SYSTEM_PACKAGE_TARGET || 'node',
  entry: [
    appPaths.appIndexJs,
  ],
  output: {
    path: appPaths.dest,
    filename: 'build.js',
  },
  resolve: {
    'modules': ['node_modules', appPaths.appNodeModules],
    'extensions': ['.web.js', '.js', '.json'],
    'alias': {
      'babel-runtime': path.dirname(
        require.resolve('babel-runtime/package.json')
      ),
    },
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.(js|jsx)$/,
        enforce: 'pre',
        use: [
          {
            options: {
              eslintPath: require.resolve('eslint'),
              // @remove-on-eject-begin
              baseConfig: {
                extends: [require.resolve('eslint-config-rear')],
              },
              ignore: false,
              useEslintrc: false,
              // @remove-on-eject-end
            },
            loader: require.resolve('eslint-loader'),
          },
        ],
        include: appPaths.src,
      },
      {
        oneOf: [
          // Process JS with Babel.
        {
          test: /\.(js|jsx)$/,
          include: appPaths.src,
          loader: require.resolve('babel-loader'),
          options: {
              babelrc: false,
              presets: [require.resolve('babel-preset-rear')],
              // @remove-on-eject-end
              // This is a feature of `babel-loader` for webpack (not Babel itself).
              // It enables caching results in ./node_modules/.cache/babel-loader/
              // directory for faster rebuilds.
              cacheDirectory: true,
            },
          },
        ]
      }
    ]
  },
  // Turn off performance hints during development because we don't do any
  // splitting or minification in interest of speed. These warnings become
  // cumbersome.
  performance: {
    hints: false,
  },
};
