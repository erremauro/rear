#!/usr/bin/env node
const fs = require('fs');
const {execSync} = require('child_process');
const path = require('path');
const packageJson = require('../package.json');
const commander = require('commander');
const logger = require('rear-logger')('rear-scripts-package');

let script;
const program = new commander.Command(packageJson.name);

program
  .version(`${packageJson.name}@v${packageJson.version}`)
  .arguments('<command>')
  .action((command) => {
    script = command;
  })
  .on('--help', () => {
    logger.log();
    logger.log('  Commands:\n');
    logger.log('    %cbuild%c\tCreate a custom build', 'blue', 'white');
    logger.log('    %cstart%c\tRun the development environment', 'blue', 'white');
    logger.log();
  })
  .parse(process.argv);

const cmdScript = path.join(__dirname, '../scripts/', `${script}.js`);

if (fs.existsSync(cmdScript)) {
  try {
      execSync(`node ${cmdScript}`, { stdio: 'inherit' } );
  } catch (err) {
    if (err) logger.error(err.message);
  }

  process.exit(0);
} else {
  logger.error(`Command ${cmdScript} not found`);
  process.exit(1);
}
