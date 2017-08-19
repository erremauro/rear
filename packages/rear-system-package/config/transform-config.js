const env = require('rear-core/get-rear-env')();

if (env.NODE_ENV !== 'production') {
  module.exports = env.REAR_SYSTEM_PACKAGE_WEBPACK === 'true'
    ? require('./webpack.config.dev')
    : require('./babel.config.dev')
} else {
  module.exports = env.REAR_SYSTEM_PACKAGE_WEBPACK === 'true'
    ? require('./webpack.config.prod')
    : require('./babel.config.prod')
}
