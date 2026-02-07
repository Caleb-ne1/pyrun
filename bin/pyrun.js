#!/usr/bin/env node
const { Command } = require('commander');
const { initializeProject } = require('../src/commands/init');
const { runProject } = require('../src/commands/run');
const path = require('path');

const program = new Command();

program
  .version('1.0.0')
  .description('PyRun CLI - Python project runner & dependency manager');

program
  .command('init <framework> [inputPath]')
  .description('Initialize a Python project with venv and modules.json')
  .showHelpAfterError('Usage: pyrun init <framework> <project-path>')
  .action((framework, inputPath = '.') => {
      const projectPath = path.resolve(process.cwd(), inputPath);
      initializeProject(framework, projectPath);
  });

program
    .command('run [entryFile]')
    .description('Run the Python project')
    .showHelpAfterError('Usage: pyrun run [entry-file] [options(--host <host> --port <port>)] \nIf entry-file is not provided, pyrun will try to auto-detect it')
    .option('--port <port>', 'Specify the port to run the server on')
    .option('--host <host>', 'Specify the host to run the server on')
    .action((entryFile = null, options) => {
        const projectPath = process.cwd();
        runProject(projectPath, entryFile, options);
    })

program.parse(process.argv);
