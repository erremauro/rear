const util = require('util');

function RearError(message, props) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;

  if (props.hasOwnProperty('code')) {
    this.code = this.props.code;
    delete props.code;
  }

  if (props.hasOwnProperty('errno')) {
    this.errno = this.props.errno;
    delete props.errno
  }

  if (props.hasOwnProperty('description')) {
    this.description = this.props.description;
    delete props.description;
  }

  this.props = Object.assign({}, props);
}
util.inherits(RearError, Error);

module.exports = RearError;
