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
    filename: 'build.js'
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
        include: appPaths.src,
      },
      {
        oneOf: [
          // Process JS with Babel.
        {
          test: /\.(js)$/,
          include: appPaths.src,
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
  }
};
