# size-reader

Use `size-reader` to read files and directories sizes, diff between them and
print the results in a human-readable format.

## Examples

### Reading sizes

In this example, `readSize` is used to read `./src` size every 3 seconds and
report a size difference when found.

Since `readSize` returns a `FileSize` object we can use it to calculate size
differences and format the results.

  ```javascript
  const {readSize} = require('rear-core/size-reader');

  let last;

  setTimeout(() => {
    readSize('./src').then(size => {
      if (!last) last = size;
      if (size.isEqual(last)) return;

      const diffSize = last.diff(size);
      const sign = diffSize.value < 0 : '-' : '+';

      const newSize = size.toString('kb');
      const diff = diffSize.toString();
      // i.e.: Directory size changed: 3024K (+1.2M)
      console.log(`Directory size changed: ${newSize} (${sign}${diff})`);
    });
  }, 3000);
  ```

### Calculate directory or file size differences

In this example, `diffSize` is used to print size informations and diff results
for two known paths.

Since `diffSize` returns a `FileSize` object we can use it to format sizes.
Here we choose to call `toString()` without arguments and let `FileSize` select
the best format (given the size), for us.

  ```javascript
  const {diffSize} = require('rear-core/size-reader');
  const root = './src';
  const build = './build';

  diffSize(root, build).then(result => {
    const rootSize = result.sizeA.toString();
    const buildSize = result.sizeB.toString();
    const diff = `${result.sign}${result.diff.toString()}`;

    console.log(`${root} compiled to ${build}`);
    // i.e.: original: 678.0K, final: 546.0K  (-132.0K)
    console.log(`original: ${rootSize}, final: ${buildSize}  (${diff})`);
  });
  ```

### FileSize format and operations

In this example, `FileSize` is used to test a size threshold with [rear-logger]
`warn`, then calculate the exceeding size and format a message to print if the
test passes.

  ```javascript
  const fs = require('fs');
  const reporter = require('rear-logger')('size-reporter');
  const {FileSize} = require('rear-core/size-reader');

  const dir = './public';
  const maxSize = new FileSize('5M');

  fs.lstat(targetDir, (err, stats) => {
    if (err) throw err;
    const size = new FileSize(stats);
    // use `compare` to test if `size` is greater than `maxSize`
    // and print a warning if the test pass.
    const warnAssert = size.compare(maxSize) > 0;
    reporter.warn(warnAssert, () => {
      const fmtSize = maxSize.toString();
      const fmtExcess = size.diff(maxSize).toString();
      console.log(
        `${dir} is exceeding the target size of ${fmtSize} by ${fmtExcess}`
      );
    });
  });
  ```

[rear-logger]: https://github.com/rearjs/rear-logger

## API

#### async readSize ( path: string ): FileSize

Asynchronously read the size of a directory content or a file and resolve with
a `FileSize` object that can be used to format the result.

##### Returns

`Promise<FileSize>` Resolve with a `FileSize` object.

#### async diff ( pathA: string, pathB: string ): SizeDiff

Asynchronously read the size of two paths and calculate the size difference
between them.

The function resolves with a `SizeDiff` object that contains informations about
both paths sizes (<tt>sizeA</tt> and <tt>sizeB</tt>) and their size difference
(<tt>diff</tt>) including the diff <tt>sign</tt> (<tt>+</tt> or <tt>-</tt>).

Every `SizeDiff` property is a `FileSize` object that can be used to format the
results.

##### Returns

`Promise<SizeDiff>` Resolve with a `SizeDiff` object.

### FileSize

Represent a file or a directory size that can be formatted with different
computer size unit measures and expose operations like addition, subtraction
and diffing of others `FileSize` object.

### Properties

| Name     | Type   | Description     |
|----------|--------|-----------------|
| value    | number | Byte size value |

### Methods

#### constructor ( size: number | FileSize | string )

Creates a new `FileSize` object from a number, a `FileSize` or a size string
(i.e. '10.2M')

#### add ( size: number | FileSize ): void

Add the given size to a `FileSize` object value.

#### subtract ( size: number | FileSize ): void

Subtract the given size from a `FileSize` object value.

#### diff ( size: number | FileSize ): FileSize

Calculate the difference between a `FileSize` object value and the given size.

##### Returns

`FileSize` The returned object is always unsigned. In order to get a signed
value, `subtract` should be used instead.

#### compare ( size: number | FileSize ): number

Compare the given size to a `FileSize` object value.

##### Returns

`number` Possible values are: -1 | 0 | 1

#### isEqual ( size: number | FileSize ): boolean

Verify if the given size is equal to a `FileSize` object value.

##### Returns

`boolean` True if equal, otherwise false.

#### toString ( format?: string ): string

Format a `FileSize` object value to string. When a `format` is not specified,
the nearest appropriate formatted string, given the size, is returned.

Accepted formats are:

* `B` (bytes)
* `K` (kilobytes)
* `M` (megabytes)
* `G` (gigabytes)
* `T` (terabytes)

or any other typical size label (i.e. `MB` or `GB`).

##### Returns

`string` Formatted size value for the given or nearest appropriate format.
