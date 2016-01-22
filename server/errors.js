var util = require('util');

var ApiClientFailure = function(message) {
  Error.call(this);
  this.message = message;
};

var NotFound = function(message) {
  Error.call(this);
  this.message = message;
};

var ModelInvalid = function(message) {
  Error.call(this);
  this.message = message;
};

var DatabaseFailure = function(message) {
  Error.call(this);
  this.message = message;
};

var Unauthorized = function(message) {
  Error.call(this);
  this.message = message;
};

var errorConstructor = function(type) {
  type.prototype.toString = function(){
    return this.message;
  };
  util.inherits(type, Error);
  return type
}

module.exports = {
  ApiClientFailure: errorConstructor(ApiClientFailure),
  NotFound: errorConstructor(NotFound),
  ModelInvalid: errorConstructor(ModelInvalid),
  DatabaseFailure: errorConstructor(DatabaseFailure),
  Unauthorized: errorConstructor(Unauthorized)
};
