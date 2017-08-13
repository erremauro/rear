// Mock eslint CLIEngine executeOnFiles

function CLIEngine (eslintConfig) {
  this.eslintConfig = eslintConfig;
}

CLIEngine.prototype.executeOnFiles = (files) => {
  const {REARTEST_ESLINT_EXIT_CODE} = process.env;
  if (!REARTEST_ESLINT_EXIT_CODE || REARTEST_ESLINT_EXIT_CODE === '0') {
    return {
      errorCount: 0,
      warningCount: 0
    }
  };

  return {
    errorCount: 1,
    warningCount: 1,
    results: files.map(file => {
      return {
        errorCount: 1,
        warningCount: 1,
        filePath: file,
        messages: [{
          severity: 'error',
          ruleId: 'no-undef',
          line: 10,
          column: 9,
          message: 'Mock variable is not defined'
        }, {
          severity: 'warning',
          ruleId: 'no-unused-vars',
          line: 3,
          column: 1,
          message: 'Mock variable was defined, but never used'
        }]
      };
    })
  }
}

module.exports = {
  CLIEngine
};
