# rear-error

Use `rear-error` to create custom Error class with ES6 syntax.

## Example

  ```javascript
  import RearError from 'rear-core/rear-error';

  class BadError extends RearError {
    constructor (message, howBad) {
      super(message, {
        code: 'EBAD',
        errno: 500,
        howBad
      });
    }
  }

  function throwError () {
    throw new BadError('A bad error occurred', 'catastrophic');
  }

  try {
    throwError()
  } catch (err) {
    if (err.code === 'EBAD') {
      console.error(
        `Bad Error: ${err.message}. Something ${err.props.howBad} happened.`
      )
      process.exit(err.errno);
    }
  }
  ```

## API

### Properties

| Name         | Type   | Description               |
|--------------|--------|---------------------------|
| message      | string | The error message         |
| stack        | string | The error stack           |
| props        | Object | Error properties bag      |
| code?        | string | The error code            |
| errno?       | number | The error number          |
| description? | string | Error generic description |

### Methods

#### constructor ( message: string, props: RearErrorProps ): RearError

Creates a new `RearError` object with the given `message` and `props`.

All `RearErrorProps` properties (_code, errno, description_) are also copied
to the root object, while other properties are left in the `props` bag.

##### Arguments

| Argument | Type           | Description           |
|----------|----------------|-----------------------|
| message  | string         | The error message     |
| props    | RearErrorProps | Rear Error properties |

##### Return

`RearError` object

### Types

##### RearErrorProps

| Property     | Type   | Description               |
|--------------|--------|---------------------------|
| code?        | string | Error code                |
| errno?       | number | Error number              |
| description? | string | Generic error description |

**Note**: Any number of properties can be passed, besides the main ones.

Read [constructor](#constructor) api for more details about how properties
are applied.
