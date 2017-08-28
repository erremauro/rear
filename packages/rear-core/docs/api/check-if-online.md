# check-if-online

Use `check-if-online` to test if the user is currently online.

## Example

  ```javascript
  const checkIfOnline = require('rear-core/check-if-online');
  checkIfOnline().then(isOnline => {
    if (isOnline) {
      // do stuff....
    }
  });
  ```

## Async Example

```javascript
import shouldUseYarn from 'rear-core/should-use-yarn';
import checkIfOnline from 'rear-core/check-if-online';
const useYarn = shouldUseYarn();
const isOnline = await checkIfOnline(useYarn);
if (isOnline) {
  // do stuff....
}
```

## API

#### async checkIfOnline (useYarn?: boolean): Promise<boolean>

Check if the user is currently online. Note that when `useYarn` is `true`,
the method automatically assume the best case scenario.

##### Returns

`Promise<boolean>` Resolve with true if user is online, otherwise false.
