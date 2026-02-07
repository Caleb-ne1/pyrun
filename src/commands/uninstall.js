const fs = require('fs-extra');
const path = require('path');
const { spawnSync } = require('child_process');

function uninstallModule(projectPath, moduleName) {
    const modulesPath = path.join(projectPath, 'modules.json');
    if (!fs.existsSync(modulesPath)) {
        console.error('modules.json not found in project directory. Please run "pyrun init <framework> <project-path>" first.');
        process.exit(1);
    }
    
    const modules = fs.readJsonSync(modulesPath);
    if (!modules.dependencies[moduleName]) {
        console.error(`Module ${moduleName} is not installed.`);
        process.exit(1);
    }
    
    const venvPath = path.join(projectPath, 'venv');
    const pipPath = process.platform === 'win32' 
        ? path.join(venvPath, 'Scripts', 'pip.exe') :
        path.join(venvPath, 'bin', 'pip');

    console.log(`Uninstalling ${moduleName}...`);
    const result = spawnSync(pipPath, ['uninstall', '-y', moduleName], { stdio: 'inherit' });

    if (result.status !== 0) {
        console.error(`Failed to uninstall ${moduleName}`);
        process.exit(1);
    }

    // remove from modules.json
    delete modules.dependencies[moduleName];
    fs.writeJsonSync(modulesPath, modules, { spaces: 2 });
    console.log(`${moduleName} uninstalled successfully`);

    // touch modules.json to trigger watcher
    const now = new Date();
    fs.utimesSync(modulesPath, now, now);
}

module.exports = {
    uninstallModule
}