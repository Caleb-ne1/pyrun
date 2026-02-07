#!/usr/bin/env node
const { Command } = require('commander');
const { initializeProject } = require('../src/commands/init');
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

program.parse(process.argv);
