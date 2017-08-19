const runCommand = require('./run-command');
const runtimeRequire = require('./runtime-require');

module.exports = runFlow;

///////////////////////////

/**
 * Run flow typecheck with an optional flow-bin.
 *
 * @param  {?string} flowBin Flow bin path
 * @return {Promise<void>}   Resolve on successfull completion
 */

function runFlow (flowBin) {
  // Use the optional flow bin path or try to find `flow-bin`
  // in the `node_modules` tree. This enable flow to be run from
  // symlinked packages, like this monorepo ;)
  const flow = flowBin || runtimeRequire('flow-bin', __filename);
  return runCommand(flow);
}
