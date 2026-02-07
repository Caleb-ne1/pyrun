const { spawnSync } = require('child_process');

const getPackageVersion = (pipPath, packageName) => {
    const result = spawnSync(pipPath, ['show', packageName], { encoding: 'utf-8' });
    if (result.status === 0) {
        const match = result.stdout.match(/Version:\s+([^\s]+)/);
        if (match) {
            return match[1];
        }
    }
    return null;
}

module.exports = {
    getPackageVersion
}