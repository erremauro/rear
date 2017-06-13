const fs = require('fs-extra');
const path = require('path');
const logger = require('rear-logger')('rear-xp-scripts-init');
const spawn = require('child_process').spawn;

module.exports = init;

///////////////////////

// type InitProps {
//   app: {
//     name: string,
//     path: string,
//     source: string
//   },
//   verbose: boolean,
//   useYarn: boolean,
//   template: ?string
// }

function init(props) {
  prepareProject(props);
  copyTemplate(props);
  installDependencies(props);
}

function prepareProject(props) {
  const appPackage = require(path.join(props.app.path 'package.json'));

  appPackage.dependencies = appPackage.dependencies || {};
  appPackage.devDependencies = appPackage.devDependencies || {};

  appPackage.scripts = {
    start: 'rear-xp start',
    build: 'rear-xp build',
    test: 'rear-xp test',
    eject: 'rear-xp eject',
  };

  fs.writeFileSync(
    path.join(props.app.path, 'package.json'),
    JSON.stringify(appPackage, null, 2)
  );

  const readmeExists = fs.existsSync(path.join(props.app.path, 'README.md'));
  if (readmeExists) {
    fs.renameSync(
      path.join(props.app.path, 'README.md'),
      path.join(props.app.path, 'README.old.md')
    );
  }
}

function copyTemplate(props) {
  const ownPackagePath = path.join(__dirname, '..', 'package.json');
  const ownPackageName = require(ownPackagePath).name;
  const ownPath = path.join(props.app.path, 'node_modules', ownPackageName);

  const templatePath = props.template
    ? path.resolve(props.app.source, props.template)
    : path.join(ownPath, 'template');

  if (fs.existsSync(templatePath)) {
    fs.copySync(templatePath, props.app.path);
  } else {
    logger.error(
      `Could not locate supplied template: %c${templatePath}`, 'green'
    );
    return;
  }

  fs.move(
    path.join(props.app.path, 'gitignore'),
    path.join(props.app.path, '.gitignore'),
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

function installDependencies(props) {
  let command;
  let args;

  if (props.useYarn) {
    command = 'yarnpkg';
    args = ['add'];
  } else {
    command = 'npm';
    args = ['install', '--save', props.verbose && '--verbose'].filter(e => e);
  }
  // args.push('rear-core', 'rear-logger');

  // Install additional template dependencies, if present
  const templateDependenciesPath = path.join(
    props.app.path,
    '.template.dependencies.json'
  );
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
