var _ = require("underscore");

var environment = process.env.ENVIRONMENT || "development";

var config = {
  development: {
    db: "mongodb://localhost/voting",
    port: 3000
  },

  test: {
    db: "mongodb://localhost/voting-test",
    port: 3000
  },

  production: {
    db: process.env.MONGOLAB_URI,
    port: process.env.PORT
  }
};

/* istanbul skip next */
if (!(environment in config)) throw new Error("Invalid environment specified: " + environment + "!");

module.exports = _.extend({}, config[environment], {
  environment: environment
});
