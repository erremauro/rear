describe('run-flow', () => {
  beforeEach(() => {
    delete require.cache[require.resolve('../run-flow')]
  });

  afterEach(() => {
    process.env.REARTEST_FLOW_BIN = true;
    process.env.REARTEST_CROSS_SPAWN_EXIT_CODE = 0;
  });

  it('Should run flow type check when flow-bin is available', () => {
    process.env.REARTEST_FLOW_BIN = true;
    process.env.REARTEST_CROSS_SPAWN_EXIT_CODE = 0;

    const runFlow = require('../run-flow');

    return runFlow();
  });

  it('Should throw RuntimeModuleNotFound if flow-bin is not installed', () => {
    process.env.REARTEST_FLOW_BIN = false;

    const runFlow = require('../run-flow');

    return runFlow().catch(err => {
      expect(err.constructor.name).toEqual('RuntimeModuleNotFound');
      expect(err.moduleName).toBe('flow-bin');
    });
  });

  it('Should throw CommandFailure if flow-bin found type check errors', () => {
    process.env.REARTEST_FLOW_BIN = true;
    process.env.REARTEST_CROSS_SPAWN_EXIT_CODE = 1;

    const flow = require('flow-bin');
    const runFlow = require('../run-flow');

    return runFlow().catch(err => {
      expect(err.constructor.name).toEqual('CommandFailure');
      expect(err.command).toEqual(flow);
    });
  });
});
