# get-rear-env

Use `get-rear-env` to get Rear related environment variables from different
type of sources as:

* `process.env`
* Local `.env` file
* Local `package.json` file

## Example

  ```javascript
  const fs = require('fs-extra');
  const env = require('rear-core/get-rear-env')();

  if (env.NODE_ENV !== 'production') {
    fs.copySync(env.REAR_PACKAGES_SRC, env.REAR_PACKAGES_DEST);
  }
  ```

## API

#### getRearEnv(): Object

Get rear-only variables from `process.env`, `.env` and `package.json`.
`NODE_ENV` is also exposed to inspect the running environment.

##### Returns

`Object` dictionary containing rear-only variables.
