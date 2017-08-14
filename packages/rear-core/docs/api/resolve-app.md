# resolve-app

Use `resolve-app` to resolve any path relative to the current location as an
absolute path. This is especially useful in scripts were you need to access
files relative to the user current working directory.

## Example

  ```javascript
  const fs = require('fs');
  const resolveApp = require('rear-core/resolve-app');
  const ownPackageJson = resolveApp('package.json');

  // creates a local "package.json" file
  fs.writeFileSync(ownPackageJson, JSON.stringify({
    name: 'my-awesome-app',
    version: '0.1.0',
    private: true
  }));
  ```

## API

#### resolveApp (...paths: <string>): string

Resolve a relative path as absolute. If more than one path is passed, they will
be joined using `path.join`.

##### Arguments

| Argument | Type     | Description                 |
|----------|----------|-----------------------------|
| ...paths | <string> | A sequence of path segments |

##### Returns

`string` An absolute path from joined `paths` relative to the current directory
