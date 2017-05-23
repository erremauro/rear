const fs = require('fs');
const path = require('path');

// Resolve path relative to current working directory
const appDirectory = fs.realpathSync(process.cwd());
module.exports = (relativePath) => path.resolve(appDirectory, relativePath);
