#!/usr/bin/env node

import commander from 'commander';
import pageLoad from '../index.js';

const { program } = commander;

console.log('Welcome, this is page loader!');

program
  .version('1.0.0', '-v, --vers', 'Output the current version')
  .description('Page loader utility')
  .helpOption('-h, --help', 'Output usage information')
  .option('-o, --output [path]', 'Specify the path to the directory for the saved page', process.cwd())
  .arguments('<pageAddress>')
  .action((pageAddress, options) => {
    console.log('current directory =', process.cwd());
    const pathToLoadFile = pageLoad(pageAddress, options.output);
    console.log('\n', pathToLoadFile);
  });

program.parse(process.argv);

// const options = program.opts();
// console.log('options', options);

if (program.vers) console.log(program.version());
