#!/usr/bin/env node
const {CLIEngine} = require('../lib/cli');

CLIEngine(process.argv)
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    process.exit(err.errno || err.code || 1);
  });
