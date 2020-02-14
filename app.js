#!/usr/bin/env node
'use strict';

// const { } = require('./lib');

const argv = require('yargs')
  .usage('Usage: $0 --numopt number --stringopt name')
  .default('numopt', 1)
  .default('s', 'name')
  .alias('s', 'stringopt')
  .help('h')
  .alias('h', 'help')
  .epilog('copyright 2019')
  .argv;

(async () => {
  try {
    console.log(argv); // eslint-disable-line no-console
  } catch(e) {
    console.log(e); // eslint-disable-line no-console
  }
})();
