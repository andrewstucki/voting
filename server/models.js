var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var promise = require('promise');
var validator = require('validator');
var hat = require('hat');
var _ = require('underscore');
var md5 = require('md5');

var config = require("./config");
var errors = require("./errors");
var queue = require("./queue");
var socket = require("./socket");

// initialize mongo
mongoose.Promise = promise;
mongoose.connect(process.env.MONGOLAB_URI || config.db);

// Users
var userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true
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
  sessionToken: String,
  gravatarUrl: String
});


var userValidators = {
  email: function(email) {
    return {
      valid: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email),
      message: "Invalid email address."
    }
  },
  username: function(username) {
    return {
      valid: /^[A-Za-z0-9]{5,15}$/.test(username),
      message: "Username must be between 5 and 15 characters and may only contain lower case letters, upper case letters, and numbers."
    }
  },
  password: function(password) {
    return {
      valid: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password),
      message: "Password must be at least 8 characters and must include at least one upper case letter, one lower case letter, and one number."
    }
  },
  confirmation: function(confirmation, password) {
    return {
     valid: confirmation !== '' && password === confirmation,
     message: "Confirmation must not be empty and must match password."
    }
  }
};

var userValidation = function(fields) {
  var usernameValidation;
  var emailValidation;
  var passwordValidation;
  var confirmationValidation;

  if (fields.username) usernameValidation = userValidators.username(fields.username);
  if (fields.email) emailValidation = userValidators.email(fields.email);
  if (fields.password) passwordValidation = userValidators.password(fields.password);
  if (fields.confirmation && fields.password) confirmationValidation = userValidators.confirmation(fields.password, fields.confirmation);

  var errors = []
  if (usernameValidation && !usernameValidation.valid) errors.push(usernameValidation.message);
  if (emailValidation && !emailValidation.valid) errors.push(emailValidation.message);
  if (passwordValidation && !passwordValidation.valid) errors.push(passwordValidation.message);
  if (confirmationValidation && !confirmationValidation.valid) errors.push(confirmationValidation.message);

  return errors;
};

userSchema.statics.signup = function(username, name, email, password, confirmation, skipEmail) {
  var schema = this;
  return new promise(function(resolve, reject) {
    var validationErrors = userValidation({username, email, password, confirmation});
    if (validationErrors.length !== 0) return reject(new errors.ModelInvalid(validationErrors.join("; ")));
    var params = {
      username: username,
      email: email,
      password: password,
      confirmed: !!skipEmail
    };
    if (name) params.name = name;
    var user = new schema(params);
    user.save().then(function(user) {
      socket.addRecord(user.renderJson(), 'users');
      if (!skipEmail) return user.sendConfirmation().then(resolve.bind(this, user)).catch(reject);
      return resolve(user);
    }).catch(function(err) {
      if (err.code === 11000) {
        if (/email/.test(err.errmsg)) return reject(new errors.ModelInvalid('Email address already taken!'));
        if (/username/.test(err.errmsg)) return reject(new errors.ModelInvalid('Username already taken!'));
      }
      return reject(new errors.DatabaseFailure(err.toString()));
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
      if (!user) return reject(new errors.NotFound("Token not found"));
      user.confirmed = true;
      user.confirmationToken = undefined;
      return user.save().then(resolve).catch(function(err){
        if (err.code === 11000) return reject(new errors.ModelInvalid("Invalid User"));
        return reject(new errors.DatabaseFailure(err.toString()));
      });
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
      if (!user) return reject(new errors.NotFound("Unable to find user with matching email address"));
      bcrypt.compare(password, user.password, function(err, match) {
        if (err) return reject(new Error("Bcrypt error: " + err.toString()));
        if (!match) return reject(new errors.ModelInvalid("Password Mismatch"));
        user.sessionToken = hat();
        user.save().then(resolve).catch(function(err) {
          if (err.code === 11000) return reject(new errors.ModelInvalid("Invalid User"));
          reject(new errors.DatabaseFailure(err.toString()));
        });
      });
    }).catch(function(err) {
      reject(new errors.DatabaseFailure(err.toString()));
    });
  });
};

userSchema.methods.logout = function() {
  this.sessionToken = undefined;
  return this.save();
};

userSchema.methods.sendConfirmation = function() {
  var user = this;
  return new promise(function(resolve, reject) {
    if (user.confirmed) return reject(new errors.ModelInvalid("User email already confirmed"));
    var job = queue.create('email', {
      user_id: user._id
    }).save(function(err) {
      if (err) return(reject(err));
      return resolve()
    })

    job.on('complete', function(result) {
      console.log('Sent confirmation email to: ' + user.email);
    }).on('failed attempt', function(errorMessage, doneAttempts) {
      console.log('Confirmation attempt ' + doneAttempts + 'for ' + user.email + ', email send failed: ' + errorMessage);
    }).on('failed', function(errorMessage) {
      console.log('Confirmation job permanently failed for ' + user.email + ': ' + errorMessage);
    });
  });
};

userSchema.methods.createPoll = function(data) {
  var user = this;
  var poll = new Poll({
    published: !!data.published,
    allowOther: !!data.allowOther,
    name: data.name,
    description: data.description,
    options: data.options.map(function(option) { return option.trim(); }) || [],
    answers: {},
    _user: this._id
  });
  return new promise(function(resolve, reject){
    var validationErrors = pollValidation({name: poll.name, options: poll.options});
    if (validationErrors.length !== 0) return reject(new errors.ModelInvalid(validationErrors.join("; ")))
    return poll.save().then(function(poll) {
      poll._user = user;
      if (poll.published) socket.addRecord(poll.renderJson(), 'polls');
      resolve(poll)
    }).catch(function(err){
      if (err.code === 11000) return reject(new errors.ModelInvalid("Invalid Poll"));
      return reject(new errors.DatabaseFailure(err.toString()));
    });
  });
};

userSchema.methods.getPolls = function() {
  var user = this;
  return new promise(function(resolve, reject) {
    Poll.find({
      _user: user._id
    }).populate('_user').then(resolve).catch(function(err) {
      return reject(new errors.DatabaseFailure(err.toString()));
    });
  });
};

userSchema.methods.getPoll = function(id) {
  var user = this;
  return new promise(function(resolve, reject) {
    Poll.findOne({
      _user: user._id,
      _id: id
    }).populate('_user').then(function(poll) {
      if (!poll) return reject(new errors.NotFound("Poll not found"));
      return resolve(poll);
    }).catch(function(err) {
      return reject(new errors.DatabaseFailure(err.toString()));
    });
  });
};

userSchema.methods.updatePoll = function(id, data) {
  var user = this;
  return new promise(function(resolve, reject) {
    Poll.findOne({
      _user: user._id,
      _id: id
    }).populate('_user').then(function(poll) {
      if (!poll) return reject(new errors.NotFound("Poll not found"));

      var published = poll.published;

      if (data.name) poll.name = data.name;
      if (data.description) poll.description = data.description;
      if (data.hasOwnProperty('allowOther')) poll.allowOther = data.allowOther;
      if (data.hasOwnProperty('published')) poll.published = data.published;
      if (data.hasOwnProperty('options')) poll.options = data.options.map(function(option) { return option.trim(); });

      var validationErrors = pollValidation({name: poll.name, options: poll.options});
      if (validationErrors.length !== 0) return reject(new errors.ModelInvalid(validationErrors.join("; ")))

      return poll.save().then(function(updated) {
        resolve(updated);
        if (updated.published !== published) updated.published ? socket.addRecord(poll.renderJson(), 'polls') : socket.removeRecord(id, 'polls');
      }).catch(function(err) {
        if (err.code === 11000) return reject(new errors.ModelInvalid("Invalid Poll"));
        return reject(new errors.DatabaseFailure(err.toString()));
      });
    }).catch(function(err) {
      return reject(new errors.DatabaseFailure(err.toString()));
    });
  });
};

userSchema.methods.deletePoll = function(id) {
  var user = this;
  return new promise(function(resolve, reject) {
    Poll.remove({
      _user: user._id,
      _id: id
    }).then(function(response) {
      if (!response.result || response.result.n !== 1) return reject(new errors.NotFound("Poll not found"));
      socket.removeRecord(id, 'polls');
      return resolve(response);
    }).catch(function(err) {
      return reject(new errors.DatabaseFailure(err.toString()));
    });
  });
};

userSchema.methods.renderToken = function() {
  return {
    id: this._id,
    username: this.username,
    name: this.name,
    gravatarUrl: this.gravatarUrl,
    email: this.email,
    token: this.sessionToken
  };
};

userSchema.methods.renderJson = function() {
  return {
    id: this._id,
    username: this.username,
    name: this.name,
    gravatarUrl: this.gravatarUrl
  };
};

var User = mongoose.model('User', userSchema);

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.confirmed && !user.confirmationToken)
    user.confirmationToken = hat();
  if (!user.gravatarUrl)
    user.gravatarUrl = "https://gravatar.com/avatar/" + md5(user.email.trim().toLowerCase());
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

var pollValidators = {
  name: function(name) {
    return {
      valid: /\S/.test(name),
      message: "Name cannot be blank."
    }
  },
  options: function(options) {
    return {
     valid: options.length > 1 && options.reduce(function(valid, value){ return valid && /\S/.test(value); }, true),
     message: "Options cannot be blank and must have more than 2 values."
    }
  }
};

var pollValidation = function(fields) {
  var nameValidation;
  var optionsValidation;

  if (fields.name) nameValidation = pollValidators.name(fields.name);
  if (fields.options) optionsValidation = pollValidators.options(fields.options);

  var errors = []
  if (nameValidation && !nameValidation.valid) errors.push(nameValidation.message);
  if (optionsValidation && !optionsValidation.valid) errors.push(optionsValidation.message);

  return errors;
};

var pollSchema = new mongoose.Schema({
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  published: {
    type: Boolean,
    default: false
  },
  allowOther: {
    type: Boolean,
    default: false
  },
  answers: mongoose.Schema.Types.Mixed,
  options: [String]
});

pollSchema.statics.published = function() {
  var schema = this;
  return new promise(function(resolve, reject){
    schema.find({
      published: true
    }).populate('_user').then(resolve).catch(function(err){
      return reject(new errors.DatabaseFailure(err.toString()));
    });
  });
};

pollSchema.methods.vote = function(response) {
  var poll = this;
  return new promise(function(resolve, reject) {
    var option = _.find(poll.options, function(option) {
      return option.toLowerCase() === response.trim().toLowerCase();
    });
    var value;
    if (option) value = option;
    else if (!option && poll.allowOther) value = response.trim();
    else return reject(new errors.ModelInvalid("Invalid Option"));
    poll.answers = poll.answers || {};
    poll.answers[value] = poll.answers[value] || 0;
    var count = ++poll.answers[value];
    poll.markModified('answers');
    poll.save().then(function(updated) {
      resolve(updated);
      socket.updateVote(poll._id, value, count);
    }).catch(function(err) {
      if (err.code === 11000) return reject(new errors.ModelInvalid("Invalid Poll"));
      return reject(new errors.DatabaseFailure(err.toString()));
    });
  });
};

pollSchema.methods.renderJson = function() {
  var poll = this;
  var payload = {
    id: poll._id,
    user: {
      id: poll._user.id,
      username: poll._user.username
    },
    name: poll.name,
    description: poll.description,
    published: poll.published,
    allowOther: poll.allowOther,
    options: poll.options,
    responses: _.values(poll.answers).reduce(function(sum, count) { return sum + count; }, 0)
  };
  return payload;
};

pollSchema.methods.renderResults = function() {
  var poll = this;
  return {
    id: poll._id,
    answers: poll.answers
  };
};

var Poll = mongoose.model('Poll', pollSchema);

module.exports = {
  User: User,
  Poll: Poll
};
