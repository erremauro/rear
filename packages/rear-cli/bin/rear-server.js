#!/usr/bin/env node

const pkg = require('../package.json');
const program = require('commander');
const createApp = require('../lib/create-app');

const programName = 'rear server';
const dependencies = ['rear-server-scripts'];

let projectName;

program
  .version(pkg.name + '@' + pkg.version)
  .option('-v, --verbose', 'Print extended output')
  .option('-s, --scriptsVersion', 'Use target scripts version')
  .option('-t, --template [value]', 'Custom template path')
  .arguments('<name>')
  .action((appName) => {
    projectName = appName;
  })
  .parse(process.argv);

createApp(
  programName,
  projectName,
  dependencies,
  program.verbose,
  program.scriptsVersion,
  program.template
);
