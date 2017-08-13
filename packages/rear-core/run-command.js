const spawn = require('cross-spawn');
const {CommandFailure} = require('./errors');

module.exports = runCommand;

//////////////////////////////

function runCommand (cmd, args = [], stdio = 'inherit') {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio });
    proc.on('error', err => {
      reject(new CommandFailure({
        command: `${cmd} ${args.join(' ')}`
      }));
    });
    proc.on('close', code => {
      if (code !== 0) {
        reject(new CommandFailure({
          command: `${cmd} ${args.join(' ')}`
        }));
      }
      resolve();
    });
  });
}
