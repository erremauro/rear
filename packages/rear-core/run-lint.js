const pkg = require('../../package.json')
const NOOP = require('./noop');
const runtimeRequire = require('./runtime-require');
const CLIEngine = runtimeRequire('eslint', __filename).CLIEngine;
const eslintCLI = new CLIEngine(pkg.eslintConfig);

const DEFAULT_REPORTER = {
  log:   NOOP,
  error: NOOP
};

module.exports = runLint;

////////////////////////

/**
 * Lint all files and print results using the provided `reporter`.
 *
 * @param  {Array<string>}  files      A list of files to be linted
 * @param  {?RearLogger}    reporter   A reporter to print results
 * @return {void}
 */

function runLint (files, reporter) {
  reporter = reporter || DEFAULT_REPORTER;
  const report = eslintCLI.executeOnFiles(files);
  if (report.errorCount > 0 || report.warningCount > 0) {
    printLintReportResults(report, reporter);
    return false;
  }
  return true;
}

function printLintReportResults (report, reporter) {
  const results = report.results.filter(child => {
    return child.errorCount || child.warningCount;
  })

  if (results.length > 0) {
    const result = results[0]
    reporter.error('Compile failed.');
    reporter.log();
    reporter.log(`%c${result.filePath}`, 'underline');
    result.messages.forEach((message) => {
      printFormattedResult(message, reporter);
    });
    printFormattedProblems(report, reporter);
  }
}

function printFormattedResult (result, reporter) {
  if (!result) return;
  let levelLabel, levelColor;

  switch (result.severity) {
    case 1:
      levelLabel = 'warning';
      levelColor = 'yellow';
      break
    case 2:
      levelLabel = 'error';
      levelColor = 'red';
      break
    default:
      levelLabel = 'info';
      levelColor = 'cyan';
      break
  }

  const normalizeNum = (num) => {
    if (num < 10) return '0' + num;
    return num;
  }

  const rule = result.ruleId;
  const errorPosition = `${normalizeNum(result.line)}:`
      + `${normalizeNum(result.column)}`;

  reporter.log(
    ` %c${errorPosition}\t%c${levelLabel}\t%c${result.message}\t%c${rule}`,
    'gray', levelColor, 'white', 'gray'
  )
}

function printFormattedProblems (report, reporter) {
  if (!report) return;
  const { errorCount, warningCount } = report;
  const total = errorCount + warningCount;

  const problemText = total > 1 || total === 0 ? 'problems' : 'problem';
  const errorText = errorCount > 1 || errorCount === 0 ? 'errors' : 'error';
  const warningText = warningCount > 1 || warningCount === 0 ? 'warnings' : 'warning';
  const icon = process.platform !== 'win32' ? '\u2716 ' : '';

  reporter.log(
    `\n%c${icon}${total} ${problemText} (${errorCount} ${errorText}, `
        +`${warningCount} ${warningText})`, 'bold_red'
  );
}
