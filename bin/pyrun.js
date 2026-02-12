#!/usr/bin/env node
const { Command } = require('commander');
const { initializeProject } = require('../src/commands/init');
const { runProject } = require('../src/commands/run');
const { showHelp } = require('../src/commands/help');
const path = require('path');

const program = new Command();

program.helpOption(false)
program
  .version('1.1.0')
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
  .command("run [entryFile]")
  .description("Run the Python project")
  .showHelpAfterError(
    "Usage: pyrun run [entry-file] [options]\n" +
      "\nDescription:\n" +
      "  Run a Python project or module.\n" +
      "\nOptions:\n" +
      "  --host <host>           Specify the host address\n" +
      "  --port <port>           Specify the port number\n" +
      "  --module <module>       Run a Python module (e.g. pyinstaller, pytest)\n" +
      "  --reload                Enable auto-reload\n" +
      "  --reloadDirs <dirs>     Comma-separated directories to watch for reload\n" +
      "  --extraArgs <args>      Extra arguments to pass to the module or script\n" +
      "\nNotes:\n" +
      "  If no entry file is provided, pyrun will attempt to auto-detect the main Python file.\n" +
      "\nExamples:\n" +
      "  pyrun run app.py\n" +
      "  pyrun run --reload\n" +
      '  pyrun run --module pyinstaller --extraArgs="--onefile app.py"\n',
    )
  .option("--port <port>", "Specify the port to run the server on")
  .option("--host <host>", "Specify the host to run the server on")
  .option(
    "--module <module>",
    "Specify a Python module to run (e.g. pyinstaller, pytest)",
  )
  .option("--reload", "enable auto reload", false)
  .option("--extraArgs <args>", "Extra arguments to pass to module/script")
  .option(
    "--reloadDirs <dirs>",
    "Comma-separated directories to watch for reload",
    "",
  )
  .action((entryFile = null, options) => {
    const projectPath = process.cwd();

    const extraArgs = options.extraArgs
      ? options.extraArgs.split(" ").filter(Boolean)
      : undefined;

    const reloadDirs = options.reloadDirs
      ? options.reloadDirs
          .split(",")
          .map((dir) => path.resolve(projectPath, dir.trim()))
      : undefined;

    runProject(projectPath, entryFile, { ...options, extraArgs, reloadDirs });
  });

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
  .option('-h, --help', 'Show help', () => {
    showHelp();
    process.exit(0);
  });

program.parse(process.argv);
