const fs = require('fs-extra');
const path = require('path');
const hyperquest = require('hyperquest');
const semver = require('semver');
const spawn = require('child_process').spawn;

module.exports = {
  getPackageName,
  getInstallPackage,
  initPackageJson,
  install
};

/////////////////////////////////

// Extract package name from tarball url or path.
function getPackageName(installPackage) {
  if (installPackage.indexOf('.tgz') > -1) {
    return getTemporaryDirectory()
      .then(obj => {
        let stream;
        if (/^http/.test(installPackage)) {
          stream = hyperquest(installPackage);
        } else {
          stream = fs.createReadStream(installPackage);
        }
        return extractStream(stream, obj.tmpdir).then(() => obj);
      })
      .then(obj => {
        const packageName = require(path.join(obj.tmpdir, 'package.json')).name;
        obj.cleanup();
        return packageName;
      })
      .catch(err => {
        // The package name could be with or without semver version, e.g. react-scripts-0.2.0-alpha.1.tgz
        // However, this function returns package name only without semver version.
        console.log(
          `Could not extract the package name from the archive: ${err.message}`
        );
        const assumedProjectName = installPackage.match(
          /^.+\/(.+?)(?:-\d+.+)?\.tgz$/
        )[1];
        console.log(
          `Based on the filename, assuming it is "${chalk.cyan(assumedProjectName)}"`
        );
        return Promise.resolve(assumedProjectName);
      });
  } else if (installPackage.indexOf('git+') === 0) {
    // Pull package name out of git urls e.g:
    // git+https://github.com/mycompany/react-scripts.git
    // git+ssh://github.com/mycompany/react-scripts.git#v1.2.3
    return Promise.resolve(installPackage.match(/([^\/]+)\.git(#.*)?$/)[1]);
  } else if (installPackage.indexOf('@') > 0) {
    // Do not match @scope/ when stripping off @version or @tag
    return Promise.resolve(
      installPackage.charAt(0) + installPackage.substr(1).split('@')[0]
    );
  }
  return Promise.resolve(installPackage);
}

function getInstallPackage(packageToInstall, version) {
  const validSemver = semver.valid(version);
  if (validSemver) {
    packageToInstall += `@${validSemver}`;
  } else if (version) {
    // for tar.gz or alternative paths
    packageToInstall = version;
  }
  return packageToInstall;
}

function initPackageJson(name, root) {
  const packageJson = {
    name,
    version: '0.1.0',
    private: true
  };

  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

function install(useYarn, dependencies, verbose, isOnline) {
  return new Promise((resolve, reject) => {
    let command, args;

    if (useYarn) {
      command = 'yarnpkg';
      args = ['add', '--exact'];
      if (!isOnline) args.push('--offline');
      [].push.apply(args, dependencies);

      if (!isOnline) {
        logger.warn('You appear to be offline.');
        logger.warn('Falling back to the local Yarn cache.');
      }
    } else {
      command = 'npm';
      args = ['install', '--save', '--save-exact'].concat(dependencies);
    }

    if (verbose) args.push('--verbose');

    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', code => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`,
        });
        return;
      }
      resolve();
    });
  });
}
