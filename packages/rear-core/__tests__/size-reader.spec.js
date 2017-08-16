const fs = require('fs-extra');
const path = require('path');
const {execSync} = require('child_process');
const SizeReader = require('../size-reader');
const FileSize = SizeReader.FileSize;
const tmpDir = path.join(__dirname, 'tmp');

describe('size-reader', () => {
  beforeEach(() => {
    fs.ensureDirSync(tmpDir);
  });

  afterEach(() => {
    fs.removeSync(tmpDir);
  });

  it('Should read file size', () => {
    const fileSize = 1024*5;
    const testFile = path.join(tmpDir, 'test-file.dat')
    createFile(testFile, 1024*5);

    expect.assertions(1);

    return SizeReader.readSize(testFile).then(size => {
      expect(size.value).toEqual(fileSize)
    })
  });

  it('Should read directory size', () => {
    const testDir = path.join(tmpDir, 'test-dir');
    const subDir = path.join(testDir, 'sub-test-dir');
    const testfiles = [
      {
        size: 1024*5,
        path: path.join(tmpDir, 'test-file-one.dat')
      },
      {
        size: 1024*3,
        path: path.join(tmpDir, 'test-file-two.dat')
      },
      {
        size: 1024*2,
        path: path.join(subDir, 'test-file-two.dat')

      }
    ]

    fs.ensureDirSync(subDir);
    testfiles.forEach(file => createFile(file.path, file.size));

    const expected = readRecursive(tmpDir);
    expect.assertions(1);

    return SizeReader.readSize(tmpDir).then(size => {
      expect(size.value).toEqual(expected);
    });
  });

  it('Should diff two directory sizes', () => {
    const testDir1 = path.join(tmpDir, 'test-dir-1');
    const testDir2 = path.join(tmpDir, 'test-dir-2');
    const files1 = [
      {
        size: 1024*5,
        path: path.join(testDir1, 'test-file-one.dat')
      },
      {
        size: 1024*3,
        path: path.join(testDir1, 'test-file-two.dat')
      },
      {
        size: 1024*2,
        path: path.join(testDir1, 'test-file-two.dat')
      }
    ]
    const files2 = [
      {
        size: 1024*4,
        path: path.join(testDir2, 'sub-file-one.dat')
      },
      {
        size: 1024*9,
        path: path.join(testDir2, 'sub-file-two.dat')
      }
    ];

    fs.ensureDirSync(testDir1);
    files1.forEach(file => createFile(file.path, file.size));

    fs.ensureDirSync(testDir2);
    files2.forEach(file => createFile(file.path, file.size));

    const testDirSize1 = readRecursive(testDir1);
    const testDirSize2 = readRecursive(testDir2);
    const expectedValue = testDirSize1 > testDirSize2
        ? testDirSize1 - testDirSize2
        : testDirSize2 - testDirSize1;
    const expectedSign = testDirSize2 < testDirSize1 ? '-' : '+';
    const expectedFormat = (expectedValue / 1024).toFixed(1) + 'K';

    return SizeReader.diffSize(testDir1, testDir2).then(results => {
      expect(results.diff.value).toEqual(expectedValue);
      expect(results.sign).toEqual(expectedSign);
      expect(results.diff.toString('k')).toEqual(expectedFormat);
    });
  });
});

describe('FileSize', () => {
  it('Should be initialized with a number, FileSize or string', () => {
    const numSize = new FileSize(200);
    const fileSize = new FileSize(numSize);
    const statsSize = new FileSize({size: 400, blksize: 4096, blocks: 0});
    const stringSize = new FileSize('1K');

    expect(numSize.value).toEqual(200);
    expect(fileSize.value).toEqual(200);
    expect(statsSize.value).toEqual(400);
    expect(stringSize.value).toEqual(1024);
  });

  it('Should format FileSize to nearest size format', () => {
    const value1 = new FileSize(200).toString();
    const value2 = new FileSize(1024*2).toString();
    const value3 = new FileSize(1024*1000*4.2).toString();
    const value4 = new FileSize(1024*1000*5789).toString();
    const value5 = new FileSize(1024*10000*659321).toString();

    expect(value1).toBe('200.0B');
    expect(value2).toBe('2.0K');
    expect(value3).toBe('4.1M');
    expect(value4).toBe('5.5G');
    expect(value5).toBe('6.1T');
  });

  it('Should format FileSize to the given format', () => {
    const value1 = new FileSize(1024*2).toString('B');
    const value2 = new FileSize(1024*1000*4.2).toString('K');
    const value3 = new FileSize(1024*1000*5789).toString('M');
    const value4 = new FileSize(1024*10000*659321).toString('G');
    const value5 = new FileSize(1024*100000*884232).toString('T');

    expect(value1).toBe('2048.0B');
    expect(value2).toBe('4200.0K');
    expect(value3).toBe('5653.3M');
    expect(value4).toBe('6287.8G');
    expect(value5).toBe('82.4T');
  });

  it('Should add both number and FileSize', () => {
    const initialSize = 200;
    const fileSize = 328;
    const numSize = 125;
    const expected = initialSize + fileSize + numSize;

    const size1 = new FileSize(initialSize);
    const size2 = new FileSize(fileSize);

    size1.add(size2);
    size1.add(numSize);

    const result = size1.getSize();

    expect(result).toEqual(expected);
  });

  it('Should subtract both number and FileSize', () => {
    const initialSize = 5000;
    const fileSize = 328;
    const numSize = 125;
    const expected = initialSize - fileSize - numSize;

    const size1 = new FileSize(initialSize);
    const size2 = new FileSize(fileSize);

    size1.subtract(size2);
    size1.subtract(numSize);

    const result = size1.getSize();

    expect(result).toEqual(expected);
  });

  it('Should diff number and FileSize', () => {
    const numSize = 200;
    const size1 = new FileSize(500);
    const size2 = new FileSize(300);
    const size3 = new FileSize(100);

    // All `diff` results should always be unsigned, so even
    // the second case (size3 - size1) should return an
    // unsigned int.
    const expected1 = Math.abs(size1.value - size2.value);
    const expected2 = Math.abs(size3.value - size1.value);
    const expected3 = Math.abs(size1.value - numSize);

    const result1 = size1.diff(size2).getSize();
    const result2 = size3.diff(size1).getSize();
    const result3 = size1.diff(numSize).getSize();

    expect(result1).toEqual(expected1);
    expect(result2).toEqual(expected2);
    expect(result3).toEqual(expected3);
  });
});

/**
 * Used during tests to verify size results.
 * @private
 *
 * @param  {string} item A directory or a file
 * @return {number}      Total directory size or file size.
 */

function readRecursive (item) {
  const stats = fs.lstatSync(item);
  let total = stats.size;
  if (!stats.isDirectory()) return total;
  const files = fs.readdirSync(item);
  files.forEach(file => {
    const size = readRecursive(path.join(item, file));
    total += size;
  });
  return total;
}

/**
 * Create an empty `file` of given `size`.
 * @private
 *
 * @param  {string} file File path
 * @param  {number} size File size (i.e. 1024*4 creates a 4k file)
 * @return {void}
 */

function createFile (file, size) {
  fs.writeFileSync(file, new Buffer(size));
}
