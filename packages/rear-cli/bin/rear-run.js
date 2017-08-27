#!/usr/bin/env node
const program = require('commander');
const version = require('../lib/rear-version');
const {Reporter} = require('../lib/reporter');
const {ProgramRunner} = require('../lib/program-runner');

let programName;

program
  .usage('[cmd] [options]')
  .arguments('[cmd]')
  .action((cmd) => {
    programName = cmd;
  })
  .version(`rear@v${version}`)
  .parse(process.argv);

if (programName) {
  const args = process.argv.splice(3, process.argv.length)
  const runner = new ProgramRunner({
    reporter: Reporter,
    programName,
    args
  });

  runner.run()
    .then(() => {
      process.exit(0);
    })
    .catch(err => {
      process.exit(err.errno || err.code || 1);
    });
}
