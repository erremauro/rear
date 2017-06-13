#!/usr/bin/env node
const pkg = require('../package.json');
const program = require('commander');

program
  .version(pkg.name + '@' + pkg.version)
  .command('server <name>', 'create a new rear express project')
  .command('client <name>', 'create a new rear react project')
  .parse(process.argv);
