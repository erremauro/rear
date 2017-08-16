const fs = require('fs');
const path = require('path');

const SizeFormats = {
  'B': {
    stringValue: 'B',
    rawValue: 1
  },
  'K': {
    stringValue: 'K',
    rawValue: 1024
  },
  'M': {
    stringValue: 'M',
    rawValue: Math.pow(1024, 2)
  },
  'G': {
    stringValue: 'G',
    rawValue: Math.pow(1024, 3)
  },
  'T': {
    stringValue: 'T',
    rawValue: Math.pow(1024, 4)
  }
}

class FileSize {
  constructor (value) {
    if (typeof value === 'number') {
      this.value = value;
    }
    else if (typeof value === 'object') {
      // test if is a node Stats object.
      if (typeof value.size === 'number') {
        this.value = value.size;
      }
      // test if is a FileSize compatible object. Not entirely cool, but ok.
      else if(typeof value.value === 'number') {
        this.value = value.value;
      }
    }
    else if (typeof value === 'string') {
      this.value = tryGetSizeFromString(value);

      if (!this.value) {
        throw new TypeError(
          `String size must follow the value-unit format. Received: ` + value
        )
      }
    }

    if (!this.value) {
      throw new TypeError(
        `Size must be a number or a FileSize. Received: ${typeof value}`
      );
    }
  }

  diff (size) {
    let value;
    if (typeof size === 'number') {
      value = size;
    } else if (size instanceof FileSize) {
      value = size.value;
    }

    // Get the overall size difference, therefore the value returned
    // is unsigned. To get a signed size difference a subtraction should
    // be used instead.

    if (value) {
      return new FileSize(Math.abs(this.value - value));
    }

    throw new TypeError(
      `Size must be a number or a FileSize. Received: ${typeof value}`
    );
  }

  add (size) {
    let value;
    if (typeof size === 'number') {
      value = size;
    }
    else if (size instanceof FileSize) {
      value = size.value;
    }

    if (value) {
      return this.value += value;
    }

    throw new TypeError(
      `Size must be a number or a FileSize. Received: ${typeof value}`
    );
  }

  subtract (size) {
    let value;
    if (typeof size === 'number') {
      value = size;
    }
    else if (size instanceof FileSize) {
      value = size.value;
    }

    if (value) {
      return this.value -= value;
    }

    throw new TypeError(
      `Size must be a number or a FileSize. Received: ${typeof value}`
    );
  }

  getSize () {
    return this.value;
  }

  isEqual (size) {
    if (typeof value === 'number') {
      return this.value === size;
    }

    if (size instanceof FileSize) {
      return this.compare(size) !== 0;
    }

    throw new TypeError(
      `Size must be a number or a FileSize. Received: ${typeof value}`
    );
  }

  toString (format) {
    if (typeof format !== 'string') {
      format = nearestSizeFormat(this.value);
    }
    // Take only the first letter as a key
    // in case the user has specified a more extended format
    // i.e. MB in place of M
    const key = format[0].toUpperCase();
    const sizeFormat = SizeFormats[key] || SizeFormats['B'];
    const size = this.getSize();
    return (size / sizeFormat.rawValue).toFixed(1) + sizeFormat.stringValue;
  }
}

module.exports = {
  FileSize,
  readSize,
  diffSize
};

//////////////////////////////

function diffSize (pathA, pathB) {
  return readSize(pathA)
    .then(sizeA => readSize(pathB).then(sizeB => ({sizeA, sizeB})))
    .then(({sizeA, sizeB}) => {
      return {
        sizeA: sizeA,
        sizeB: sizeB,
        diff: sizeA.diff(sizeB),
        sign: sizeA > sizeB ? '+' : '-'
      }
    });
}

function readSize (item) {
  return new Promise((resolve, reject) => {
    fs.lstat(item, (err, stats) => {
      if (err) return reject(err);
      const total = new FileSize(stats.size);

      if (!stats.isDirectory()) return resolve(total);

      fs.readdir(item, (err, files) => {
        if (err) return reject(err);
        const allPromise = files.map(diritem =>
          readSize(path.join(item, diritem))
            .then(size => total.add(size))
        );

        Promise.all(allPromise)
          .catch(reject)
          .then(() => {
            resolve(total);
          });
      })
    });
  });
}

function nearestSizeFormat (size) {
  const keys = Object.keys(SizeFormats);
  for (let i = 0; i < keys.length; i++) {
    const next = SizeFormats[keys[i+1]];
    const current = SizeFormats[keys[i]];

    if (!next) return current.stringValue;
    if (size > next.rawValue) continue;

    return current.stringValue;
  }
  return SizeFormats['B'];
}

function tryGetSizeFromString (sizeString) {
  const pattern = /([\d,\.]+)([b,k,m,g,t,B,K,M,G,T])/g;
  const matches = pattern.exec(sizeString);

  if (matches.length < 3) return null;

  const size = parseFloat(matches[1]).toFixed(1);
  const unitValue = matches[2].toUpperCase();
  const multiplier = SizeFormats[unitValue].rawValue;
  const value = size * multiplier;

  return value;
}
