const runLint = require('../run-lint');

// This test make use of `process.env.REARTEST_ESLINT_EXIT_CODE` to control
// eslint mock exit code. See: `../__mocks__/eslint.js`

describe('run-lint', () => {
  it('Should run lint without errors', () => {
    process.env.REARTEST_ESLINT_EXIT_CODE = 0;
    const reporter = {
      log: jest.fn(),
      error: jest.fn()
    };
    const success = runLint(['index.js'], reporter);
    expect(success).toBe(true);
    expect(reporter.log).not.toHaveBeenCalled();
    expect(reporter.error).not.toHaveBeenCalled();
  });

  it('Should print errors if lint fail', () => {
    process.env.REARTEST_ESLINT_EXIT_CODE = 1;
    const reporter = {
      log: jest.fn(),
      error: jest.fn()
    };

    const success = runLint(['index.js'], reporter);
    expect(success).toBe(false);
    expect(reporter.log).toHaveBeenCalled();
    expect(reporter.error).toHaveBeenCalled();
  });
});
