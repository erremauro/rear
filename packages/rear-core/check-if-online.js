const shouldUseYarn = require('./should-use-yarn');
const dns = require('dns');

module.exports = checkIfOnline;

////////////////////////////

function checkIfOnline (useYarn) {
  if (useYarn) {
    // assume the best case scenario.
    return Promise.resolve(true);
  }
  return new Promise((resolve, reject) => {
      dns.lookup('registry.yarnpkg.com', err => {
        resolve(err === null);
      });
  });
}
