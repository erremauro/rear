const resolveApp = require('./resolve-app')

// Resolve package.json in cwd
module.exports = () => require(resolveApp('package.json'))
