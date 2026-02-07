const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const { spawn } = require('child_process');

function runProject(projectPath, entryFile = null, options = {}) {
    // modules path
    const modulesPath = path.join(projectPath, 'modules.json');
    if (!fs.existsSync(modulesPath)) {
        console.error('modules.json not found in project directory. Please run "pyrun init <framework> <project-path>" first.');
        process.exit(1);
    }

    const modules = fs.readJsonSync(modulesPath);
    const framework = modules.framework;
    const venvPath = path.join(projectPath, 'venv');
    const pythonPath = process.platform === 'win32' ? path.join(venvPath, 'Scripts', 'python.exe') : path.join(venvPath, 'bin', 'python');

    if (!fs.existsSync(pythonPath)) {
        console.error('Virtual environment not found. Please run "pyrun init <framework> <project-path>" first.');
        process.exit(1);
    }

    // host
    const host = options.host || 'localhost';
    // port
    const port = options.port || (framework === 'django' ? 8000 : 5000);

    // auto detect entry file if not provided
    if (!entryFile) {
        const candidates = ['app.py', 'main.py', 'manage.py'];
        for (const file of candidates) {
            if (fs.existsSync(path.join(projectPath, file))) {
                entryFile = file;
                break;
            }
        }

        // pick first .py file if no candidates found
        if (!entryFile) {
            const pyFiles = fs.readdirSync(projectPath).filter(f => f.endsWith('.py'));
            if (pyFiles.length > 0) {
                entryFile = pyFiles[0];
            } else {
                console.error('No entry file found. Please specify an entry file or add a .py file to the project directory.');
                process.exit(1);
            }
        }
    }

    let command;
    let args = [];

    switch (framework.toLowerCase()) {
        case 'django':
            command = pythonPath;
            args = ['manage.py', 'runserver', `${host}:${port}`];
            break;
        case 'flask':
           if (!entryFile) entryFile = 'app.py';
           process.env.FLASK_APP = entryFile;
           command = path.join(venvPath, process.platform === 'win32' ? 'Scripts' : 'bin', 'flask');
           args = ['run', '--host', host, '--port', port, '--reload'];
            break;
        case 'fastapi':
            if (!entryFile) entryFile = 'main';
            if (entryFile.endsWith('.py')) entryFile = entryFile.replace(/\.py$/, '');
            command = path.join(venvPath, process.platform === 'win32' ? 'Scripts' : 'bin', 'uvicorn');
            args = [`${entryFile}:app`, '--host', host, '--port', port, '--reload', '--reload-dir', projectPath];
            break;
        case 'python':
            command = pythonPath;
            args = [entryFile];
            break;
        default:
            console.error(`Unsupported framework: ${framework}`);
            process.exit(1);
    }

    console.log(`Running ${framework} project with command: ${command} ${args.join(' ')}`);
    let child = spawn(command, args, { stdio: 'inherit' });

    const watcher = chokidar.watch(path.join(projectPath, 'modules.json'), { ignoreInitial: true });

    watcher.on('change', (filePath) => {
        console.log(`File changed: ${filePath}. Restarting server...`);
        child.kill();
        child = spawn(command, args, { stdio: 'inherit' });
    });

    process.on('SIGINT', () => {
        console.log('Shutting down server...');
        child.kill();
        process.exit(0);
    });
}

module.exports = {
    runProject
 } 