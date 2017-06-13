const fs = require('fs-extra');
const path = require('path');
const logger = require('rear-logger')('cleanup');

module.exports = cleanGeneratedFiles;

//////////////////////////////////////

function cleanGeneratedFiles(root, appName) {
  const knownGeneratedFiles = [
    'package.json',
    'npm-debug.log',
    'yarn-error.log',
    'yarn-debug.log',
    'node_modules',
  ];
  const currentFiles = fs.readdirSync(path.join(root));
  currentFiles.forEach(file => {
    knownGeneratedFiles.forEach(fileToMatch => {
      // This will catch `(npm-debug|yarn-error|yarn-debug).log*` files
      // and the rest of knownGeneratedFiles.
      if (
        (fileToMatch.match(/.log/g) && file.indexOf(fileToMatch) === 0) ||
        file === fileToMatch
      ) {
        logger.info(`Deleting generated file: %c${file}`, 'cyan');
        fs.removeSync(path.join(root, file));
      }
    });
  });

  const remainingFiles = fs.readdirSync(path.join(root));
  if (!remainingFiles.length) {
    // Delete target folder if empty
    logger.info(
      `Deleting %c${appName}%c from %c${path.resolve(root, '..')}`,
      'green', 'white', 'cyan'
    );
    process.chdir(path.resolve(root, '..'));
    fs.removeSync(path.join(root));
  }
}
