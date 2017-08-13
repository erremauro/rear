const runCommand = require('./run-command');
const runtimeRequire = require('./runtime-require');
const flow = runtimeRequire('flow-bin', __filename);

module.exports = () => runCommand(flow);
