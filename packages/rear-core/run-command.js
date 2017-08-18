const spawn = require('cross-spawn')
const {CommandFailure} = require('./errors')

module.exports = runCommand

//////////////////////////////

function runCommand (cmd, args = [], stdio = 'inherit') {
    return new Promise((resolve, reject) => {
        const proc = spawn(cmd, args, { stdio })
        const completeCommand = `${cmd} ${args.join(' ')}`.trim()

        proc.on('error', err => {
            return reject(new CommandFailure(completeCommand))
        })

        proc.on('close', code => {
            code = sanitizeCode(code)
            if (code !== 0) {
                return reject(new CommandFailure(completeCommand, code))
            }
            resolve()
        })
    })
}

function sanitizeCode (code) {
    if (typeof code === 'string') {
        try {
            code = parseInt(code, 10)
        } catch (err) {
            // Ignore errors
        }
    }
    return code
}
