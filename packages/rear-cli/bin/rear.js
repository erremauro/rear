#!/usr/bin/env node
const program = require('commander');
const version = require('../lib/rear-version');

program
  .usage('[cmd] [options]')
  .version(`rear@v${version}`)
  .command('new <name>', 'create a new rear project')
  .command('run [cmd] [options]', 'create a new rear project', {isDefault: true})
  .parse(process.argv);
