const execSync = require('child_process').execSync
const resolveApp = require('./resolve-app')

module.exports = shouldUseYarn

/////////////////////////////////

function shouldUseYarn () {
    try {
        const yarnLock = resolveApp('yarn.lock')
        execSync(yarnLock, { stdio: 'ignore' })
        return true
    } catch (err) {
        return false
    }
}
