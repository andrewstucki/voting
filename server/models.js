var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var promise = require('promise');
var validator = require('validator');
var mandrill = require('mandrill-api/mandrill');
var hat = require('hat');
var _ = require('underscore');

var config = require("./config");

var mailer = new mandrill.Mandrill(process.env.MANDRILL_APIKEY);

var generateEmail = function(fields) {
  var emailTemplate = {
    "from_email": "andrew.stucki@gmail.com",
    "from_name": "Voting App",
    "headers": {
      "Reply-To": "andrew.stucki+reply@gmail.com"
    }
  };

  return _.extend({}, emailTemplate, fields);
};

// initialize mongo
mongoose.Promise = promise;
mongoose.connect(process.env.MONGOLAB_URI || config.db);

// Users
var userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  password: {
    type: String,
    required: true
  },
  confirmed: {
    type: Boolean,
    default: false,
    require: true
  },
  confirmationToken: String,
  sessionToken: String
});

userSchema.statics.signup = function(email, password, passwordConfirmation,
  skipEmail) {
  var schema = this;
  return new promise(function(resolve, reject) {
    if (password !== passwordConfirmation)
      return reject("Password confirmation does not match");
    if (!validator.isEmail(email))
      return reject("Email address is invalid");
    var params = {
      email: email,
      password: password,
      confirmed: !!skipEmail
    };
    var user = new schema(params);
    user.save().then(function(user) {
      if (!skipEmail) user.sendConfirmation().then(resolve);
      return resolve(user);
    }).catch(function(err) {
      if (err.code === 11000) return reject(
        "Email address already taken");
      return reject(err.toString());
    });
  });
};

userSchema.statics.confirm = function(token) {
  var schema = this;
  return new promise(function(resolve, reject) {
    schema.findOne({
      confirmationToken: token,
      confirmed: false
    }).then(function(user) {
      if (!user) return reject("Unable to find matching token");
      user.confirmed = true;
      user.confirmationToken = undefined;
      return user.save();
    }).then(function(user) {
      resolve(user);
    });
  });
};

userSchema.statics.login = function(email, password) {
  var schema = this;
  return new promise(function(resolve, reject) {
    schema.findOne({
      email: email
    }).then(function(user) {
      if (!user) return reject(
        "Unable to find user with matching email address");
      bcrypt.compare(password, user.password, function(err, match) {
        if (err) return reject(err);
        if (!match) return reject("Password mismatch");
        user.sessionToken = hat();
        user.save().then(function(user) {
          resolve(user);
        }).catch(function(err) {
          reject(err);
        });
      });
    }).catch(function(err) {
      reject(err);
    });
  });
};

userSchema.statics.logout = function(token) {
  var schema = this;
  return new promise(function(resolve, reject) {
    schema.findOne({
      sessionToken: token
    }).then(function(user) {
      if (!user) return reject("Invalid token");
      user.sessionToken = undefined;
      user.save().then(function(user) {
        resolve(user);
      }).catch(function(err) {
        reject(err);
      });
    }).catch(function(err) {
      reject(err);
    });
  });
};

userSchema.methods.confirmationEmail = function() {
  var user = this;

  return generateEmail({
    html: "Click <a href=\"http://localhost:3000/confirm/" + user.confirmationToken +
      "\">here</a> to confirm your account",
    text: "Go to http://localhost:3000/confirm/" + user.confirmationToken +
      " to confirm your account",
    subject: "Account confirmation",
    to: [{
      "email": user.email,
      "type": "to"
    }]
  });
};

userSchema.methods.sendConfirmation = function() {
  console.log("sending confirmation");
  var user = this;

  return new promise(function(resolve, reject) {
    if (user.confirmed) return reject("User email already confirmed");
    mailer.messages.send({
      message: user.confirmationEmail(),
      async: false
    }, function(result) {
      return resolve(result);
    }, function(err) {
      return reject(err);
    });
  });
};

var User = mongoose.model('User', userSchema);

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.confirmed && !user.confirmationToken)
    user.confirmationToken = hat();
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// Polls

module.exports = {
  User: User
};
