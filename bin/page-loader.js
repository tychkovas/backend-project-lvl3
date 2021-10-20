#!/usr/bin/env node

import commander from 'commander';
import pageLoad from '../src/index.js';

const { program } = commander;

program
  .version('1.0.0', '-v, --vers', 'Output the current version')
  .description('Page loader utility')
  .helpOption('-h, --help', 'Output usage information')
  .option('-o, --output [path]', 'Specify the path to the directory for the saved page', process.cwd())
  .arguments('<pageAddress>')
  .action(async (pageAddress, options) => {
    pageLoad(pageAddress, options.output)
      .then((pathSave) => console.log('Saved successfully:', pathSave))
      .catch((error) => {
        console.error('Error:', error.message);
        process.exit(1);
      });
  });

program.parse(process.argv);

if (program.vers) console.log(program.version());
