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

// initialize mongo
mongoose.Promise = promise;
mongoose.connect(process.env.MONGOLAB_URI || config.db);

// Users
var userSchema = new mongoose.Schema({
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

userSchema.statics.signup = function(email, password, passwordConfirmation, skipEmail) {
  var schema = this;
  return new promise(function(resolve, reject) {
    if (password !== passwordConfirmation)
      return reject(new errors.ModelInvalid("Password confirmation does not match"));
    if (!validator.isEmail(email))
      return reject(new errors.ModelInvalid("Invalid Email Address"));
    var params = {
      email: email,
      password: password,
      confirmed: !!skipEmail
    };
    var user = new schema(params);
    user.save().then(function(user) {
      if (!skipEmail) return user.sendConfirmation().then(resolve.bind(this, user)).catch(reject);
      return resolve(user);
    }).catch(function(err) {
      if (err.code === 11000) return reject(new errors.ModelInvalid("Email Address Already Taken"));
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
    options: data.options || [],
    answers: {},
    _user: this._id
  });
  return new promise(function(resolve, reject){
    return poll.save().then(function(poll) {
      poll._user = user;
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
      if (data.name) poll.name = data.name;
      if (data.hasOwnProperty('allowOther')) poll.allowOther = data.allowOther;
      if (data.hasOwnProperty('published')) poll.published = data.published;
      if (data.hasOwnProperty('options')) poll.options = data.options;
      return poll.save().then(resolve).catch(function(err) {
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
      return resolve(response);
    }).catch(function(err) {
      return reject(new errors.DatabaseFailure(err.toString()));
    });
  });
};

userSchema.methods.renderToken = function() {
  return {
    id: this._id,
    email: this.email,
    token: this.sessionToken,
    gravatarUrl: this.gravatarUrl
  };
};

userSchema.methods.renderJson = function() {
  return {
    id: this._id,
    email: this.email,
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

var pollSchema = new mongoose.Schema({
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
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
      return option === response;
    });
    var value;
    if (option) value = option;
    else if (!option && poll.allowOther) value = response;
    else return reject(new errors.ModelInvalid("Invalid Option"));
    poll.answers = poll.answers || {};
    poll.answers[value] = poll.answers[value] || 1;
    poll.answers[value]++;
    poll.markModified('answers');
    poll.save().then(resolve).catch(function(err) {
      if (err.code === 11000) return reject(new errors.ModelInvalid("Invalid Poll"));
      return reject(new errors.DatabaseFailure(err.toString()));
    });
  });
};

pollSchema.methods.renderJson = function(admin) {
  var poll = this;
  var payload = {
    id: poll._id,
    user: {
      id: poll._user.id,
      email: poll._user.email
    },
    name: poll.name,
    published: poll.published,
    allowOther: poll.allowOther,
    options: poll.options,
  };
  if (admin) payload['answers'] = poll.answers;
  return payload;
};

var Poll = mongoose.model('Poll', pollSchema);

module.exports = {
  User: User,
  Poll: Poll
};
