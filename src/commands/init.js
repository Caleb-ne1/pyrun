const fs = require('fs-extra');
const path = require('path');
const { spawnSync } = require('child_process');
const { getPackageVersion } = require('../../util/getPackageVersion');


function initializeProject(framework, projectPath) {

    if (!framework || !projectPath) {
        console.error('Usage: pyrun init <framework> <project-path>');
        process.exit(1);
    }

    // validate framework
    const supportedFrameworks = ['django', 'flask', 'fastapi', 'python'];
    if (!supportedFrameworks.includes(framework.toLowerCase())) {
        console.error(`Unsupported framework: ${framework}`);
        console.error(`Supported frameworks: ${supportedFrameworks.join(', ')}`);
        process.exit(1);
    }

    // ensure project path exists
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
    }

    // creates modules.json if it doesn't exist
    const modulesPath = path.join(projectPath, 'modules.json');
    if (!fs.existsSync(modulesPath)) {
        fs.writeJsonSync(modulesPath, { framework, dependencies: {} }, { spaces: 2 });
    } else {
        console.warn('modules.json already exists, skipping creation');
    }

    // create virtual environment if it doesn't exist
    const venvPath = path.join(projectPath, 'venv');

    if (!fs.existsSync(venvPath)) {
        console.log('Creating virtual environment...');
        const result = spawnSync('python3', ['-m', 'venv', venvPath], { stdio: 'inherit' });

        if (result.status !== 0) {
            console.error('Failed to create virtual environment');
            process.exit(1);
        }
        console.log('Virtual environment created successfully');

    } else {
        console.warn('Virtual environment already exists, skipping creation');
    }

    // install core dependencies
    const pipPath = process.platform === 'win32' ? path.join(venvPath, 'Scripts', 'pip.exe') : path.join(venvPath, 'bin', 'pip');
    const modules = fs.readJsonSync(modulesPath);
    switch (framework.toLowerCase()) {
        case 'django':
            spawnSync(pipPath, ['install', 'django'], { stdio: 'inherit' });
            const djangoVersion = getPackageVersion(pipPath, 'django');
            modules.dependencies['django'] = djangoVersion || 'latest';
            break;
        case 'flask':
            spawnSync(pipPath, ['install', 'flask'], { stdio: 'inherit' });
            const flaskVersion = getPackageVersion(pipPath, 'flask');
            modules.dependencies['flask'] = flaskVersion || 'latest';
            break;
        case 'fastapi':
            spawnSync(pipPath, ['install', 'fastapi', 'uvicorn'], { stdio: 'inherit' });
            const fastapiVersion = getPackageVersion(pipPath, 'fastapi');
            const uvicornVersion = getPackageVersion(pipPath, 'uvicorn');
            modules.dependencies['fastapi'] = fastapiVersion || 'latest';
            modules.dependencies['uvicorn'] = uvicornVersion || 'latest';
            break;
        case 'python':
            break;
    }

    // save updated modules.json
    fs.writeJsonSync(modulesPath, modules, { spaces: 2 });

    console.log(`Project initialized successfully with ${framework} framework at ${projectPath}`);
}

module.exports = {
    initializeProject
};