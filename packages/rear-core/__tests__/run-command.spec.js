const runCommand = require('../run-command');

it('Should run a command successfully', () => {
  const command = 'npm';
  const commandArgs = ['owner', 'ls', 'rear-core'];
  return runCommand(command, commandArgs);
});

it('Should throw CommandFailure error on bad commands', () => {
  const command = 'jarn';
  const commandArgs = ['owner', 'ls', 'rear-core'];
  const runCommand = require('../run-command');
  return runCommand(command, commandArgs, 'ignore')
    .catch(err => {
      expect(err).toBeDefined();
      expect(err.constructor.name).toEqual('CommandFailure');
    });
})
