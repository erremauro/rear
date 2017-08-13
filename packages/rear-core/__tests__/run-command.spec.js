const runCommand = require('../run-command');

describe('run-command', () => {
  afterEach(() => {
    process.env.REARTEST_CROSS_SPAWN_EXIT_CODE = 0;
  });

  it('Should run a command successfully', () => {
    process.env.REARTEST_CROSS_SPAWN_EXIT_CODE = 0;
    const command = 'npm';
    const commandArgs = ['owner', 'ls', 'rear-core'];
    return runCommand(command, commandArgs);
  });

  it('Should throw CommandFailure error on bad commands', () => {
    process.env.REARTEST_CROSS_SPAWN_EXIT_CODE = 1;
    const command = 'jarn';
    const commandArgs = ['owner', 'ls', 'rear-core'];
    const runCommand = require('../run-command');
    return runCommand(command, commandArgs, 'ignore')
      .catch(err => {
        expect(err).toBeDefined();
        expect(err.constructor.name).toEqual('CommandFailure');
      });
  });
})
