#!/usr/bin/env node
const program = require('commander');
const version = require('../lib/rear-version');
const {Reporter} = require('../lib/reporter');
const {createApp} = require('../lib/app-installer');

let projectName;

program
  .usage('<project-name> [options]')
  .version(`rear@v${version}`)
  .arguments('<project-name>')
  .action((name) => {
    projectName = name;
  })
  .option(
    '--system-type <system-name>',
    'use the given system template. Default: client'
  )
  .option(
    '--system-version <version>',
    'use the given template version. Default: latest'
  )
  .option(
    '-v, --verbose',
    'print additional logs'
  )
  .parse(process.argv);

if (projectName) {
  return createApp({
    appName: projectName,
    dependencies: ['rear-core'],
    systemType: program.systemName || 'client',
    version: program.systemVersion,
    reporter: Reporter
  });
}
