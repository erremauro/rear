const util = require('util');

function RearError(message, props) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.props = Object.assign({}, props);

  if (this.props.hasOwnProperty('code')) {
    this.code = this.props.code;
    delete this.props.code;
  }

  if (this.props.hasOwnProperty('errno')) {
    this.errno = this.props.errno;
    delete this.props.errno
  }

  if (this.props.hasOwnProperty('description')) {
    this.description = this.props.description;
    delete this.props.description;
  }
}
util.inherits(RearError, Error);

module.exports = RearError;
