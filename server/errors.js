var util = require('util');

var errorConstructor = function() {
  var newError = function (message) {
    Error.call(this);
    this.message = message;
  };
  newError.prototype.toString = function(){
    return this.message;
  };
  util.inherits(newError, Error);
  return newError
}

module.exports = {
  ApiClientFailure: errorConstructor(),
  NotFound: errorConstructor(),
  ModelInvalid: errorConstructor(),
  DatabaseFailure: errorConstructor(),
  Unauthorized: errorConstructor()
};
