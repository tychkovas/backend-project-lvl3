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
    // console.log('pageAddress', pageAddress);
    // console.log('options.output', options.output);
    const pathToLoadFile = pageLoad(pageAddress, options.output);

    console.log('\n', pathToLoadFile);
    // console.log('output = ', output);
    // console.log('program.output', program.output);
    // console.log('process.cwd()', process.cwd());
    // console.log('options A', options);
  });

program.parse(process.argv);

// const options = program.opts();
// console.log('options', options);

if (program.vers) console.log(program.version());
