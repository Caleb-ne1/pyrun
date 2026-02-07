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

program
    .command('install [modules...]')
    .description('Install additional Python modules to the project')
    .option('--all', 'Install all modules listed in modules.json')
    .showHelpAfterError('Usage: pyrun install <module1[:version]> <module2[:version]> ... \nExample: pyrun install requests flask:2.0.1 or pyrun install --all')
    .action((modules, options) => {
        const { installModule, installAllModules } = require('../src/commands/install');
        const projectPath = process.cwd();
        if (options.all) {
            installAllModules(projectPath);
        } else if (modules && modules.length > 0) {
            installModule(projectPath, modules);
        } else {
            console.error('No modules specified. Use "pyrun install <module1[:version]> <module2[:version]> ..." or "pyrun install --all"');
            process.exit(1);
        }
    })

program
    .command('uninstall <module>')
    .description('Uninstall a Python module from the project')
    .showHelpAfterError('Usage: pyrun uninstall <module> \nExample: pyrun uninstall requests')
    .action((module) => {
        const { uninstallModule } = require('../src/commands/uninstall');
        const projectPath = process.cwd();
        uninstallModule(projectPath, module);
    })

program
    .command('help')
    .description('Show help information')
    .action(() => {
        const { showHelp } = require('../src/commands/help');
        showHelp();
    })
    
program.parse(process.argv);
