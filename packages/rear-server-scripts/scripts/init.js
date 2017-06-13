const fs = require('fs-extra');
const path = require('path');
const logger = require('rear-logger')('rear-xp-scripts-init');
const spawn = require('child_process').spawn;

module.exports = init;

///////////////////////

function init(root, appName, origin, verbose, useYarn, template) {
  prepareProject(root);
  copyTemplate(root, origin, template);
  installDependencies(root, useYarn, verbose);
}

function prepareProject(root) {
  const appPackage = require(path.join(root, 'package.json'));

  appPackage.dependencies = appPackage.dependencies || {};
  appPackage.devDependencies = appPackage.devDependencies || {};

  appPackage.scripts = {
    start: 'rear start',
    build: 'rear build',
    test: 'rear test',
    eject: 'rear eject',
  };

  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(appPackage, null, 2)
  );

  const readmeExists = fs.existsSync(path.join(root, 'README.md'));
  if (readmeExists) {
    fs.renameSync(
      path.join(root, 'README.md'),
      path.join(root, 'README.old.md')
    );
  }
}

function copyTemplate(root, origin, template) {
  const ownPackagePath = path.join(__dirname, '..', 'package.json');
  const ownPackageName = require(ownPackagePath).name;
  const ownPath = path.join(root, 'node_modules', ownPackageName);

  const templatePath = template
    ? path.resolve(origin, template)
    : path.join(ownPath, 'template');

  if (fs.existsSync(templatePath)) {
    fs.copySync(templatePath, root);
  } else {
    logger.error(
      `Could not locate supplied template: %c${templatePath}`, 'green'
    );
    return;
  }

  fs.move(
    path.join(root, 'gitignore'),
    path.join(root, '.gitignore'),
    [],
    err => {
      if (err) {
        // Append if there's already a `.gitignore` file there
        if (err.code === 'EEXIST') {
          const data = fs.readFileSync(path.join(props.app.path, 'gitignore'));
          fs.appendFileSync(path.join(props.app.path, '.gitignore'), data);
          fs.unlinkSync(path.join(props.app.path, 'gitignore'));
        } else {
          throw err;
        }
      }
    }
  );
}

function installDependencies(root, useYarn, verbose) {
  let command;
  let args;

  if (useYarn) {
    command = 'yarnpkg';
    args = ['add'];
  } else {
    command = 'npm';
    args = ['install', '--save', verbose && '--verbose'].filter(e => e);
  }
  // args.push('rear-core', 'rear-logger');

  // Install additional template dependencies, if present
  const templateDependenciesPath = path.join(root, '.template.dependencies.json');
  if (fs.existsSync(templateDependenciesPath)) {
    const templateDependencies = require(templateDependenciesPath).dependencies;
    args = args.concat(
      Object.keys(templateDependencies).map(key => {
        return `${key}@${templateDependencies[key]}`;
      })
    );
    fs.unlinkSync(templateDependenciesPath);
  }
}
