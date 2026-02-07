const fs = require('fs-extra');
const path = require('path');
const { spawnSync } = require('child_process');

function installModule(projectPath, modules) {
    const modulesPath = path.join(projectPath, 'modules.json');
    if (!fs.existsSync(modulesPath)) {
        console.error('modules.json not found in project directory. Please run "pyrun init <framework> <project-path>" first.');
        process.exit(1);
    }

    // data
    const data = fs.readJsonSync(modulesPath);
    if (!data.dependencies) {
        data.dependencies= {};
    }

    const venvPath = path.join(projectPath, 'venv');
    const pipPath = process.platform === 'win32' 
        ? path.join(venvPath, 'Scripts', 'pip.exe') :
        path.join(venvPath, 'bin', 'pip');

    // modules
    modules.forEach(mod => {
        const [packageName, version] = mod.split(':');
        const desiredVersion = version || 'latest';
        const currentVersion = data.dependencies[packageName];

        if (currentVersion === desiredVersion) {
            console.log(`${packageName} is already at the desired version (${desiredVersion}), skipping installation.`);
            return;
        }

        const pkgStr = version ? `${packageName}==${version}` : packageName;
        console.log(`Installing ${pkgStr}...`);
        const result = spawnSync(pipPath, ['install', pkgStr], { stdio: 'inherit' });

        if (result.status !== 0) {
            console.error(`Failed to install ${pkgStr}`);
            process.exit(1);
        }

        // get installed version
        const versionInstalled =  spawnSync(pipPath, ['show', packageName], { encoding: 'utf-8' });
        let installedVersion = 'latest';

        if (versionInstalled.status === 0) {
            const match = versionInstalled.stdout.match(/^Version:\s*(.*)$/m);
            if (match) {
                installedVersion = match[1];
            }
        }

        data.dependencies[packageName] = installedVersion;
        console.log(`${packageName} updated successfully to version ${installedVersion}`);

    })
    fs.writeJsonSync(modulesPath, data, { spaces: 2 });

    // touch modules.json to trigger watcher
    const now = new Date();
    fs.utimesSync(modulesPath, now, now);

    console.log('All modules installed/updated successfully');
}

// install all modules from modules.json
function installAllModules(projectPath) {
    const modulesPath = path.join(projectPath, 'modules.json');
    if (!fs.existsSync(modulesPath)) {
        console.error('modules.json not found in project directory. Please run "pyrun init <framework> <project-path>" first.');
        process.exit(1);
    }

    const modules = fs.readJsonSync(modulesPath);
    const deps = modules.dependencies || {};
    if (Object.keys(deps).length === 0) {
        console.log('No dependencies to install.');
        return;
    }

    const venvPath = path.join(projectPath, 'venv');
    const pipPath = process.platform === 'win32' 
        ? path.join(venvPath, 'Scripts', 'pip.exe') :
        path.join(venvPath, 'bin', 'pip');

    console.log('Installing all dependencies from modules.json...');
    for (const [packageName, version] of Object.entries(deps)) {
        const pkgStr = version && version !== 'latest' ? `${packageName}==${version}` : packageName;
        console.log(`Installing ${pkgStr}...`);
        const result = spawnSync(pipPath, ['install', pkgStr], { stdio: 'inherit' });
        
        if (result.status !== 0) {
            console.error(`Failed to install ${pkgStr}`);
            process.exit(1);
        }
    }
    console.log('All dependencies installed successfully');
}

module.exports = {
    installModule,
    installAllModules
}