var fs = require('fs');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var promise = require('promise');
var validator = require('validator');
var mandrill = require('mandrill-api/mandrill');
var hat = require('hat');
var handlebars = require('handlebars');
var _ = require('underscore');

var config = require("./config");
var errors = require("./errors");

if (!process.env.MANDRILL_APIKEY) throw new Error("Mandrill API key required!");

var mailer = new mandrill.Mandrill(process.env.MANDRILL_APIKEY);
var templates = {
  html: {},
  plain: {}
};

_.each(["html", "plain"], function(templateType) {
  var dirname = __dirname + "/emails/" + templateType + "/";
  fs.readdir(dirname, function(err, filenames) {
    if (err) throw new Error("Unable to read template directory");
    _.each(filenames, function(filename) {
      fs.readFile(dirname + filename, 'utf-8', function(err,
        content) {
        var templateName = filename.split(".")[0];
        if (err) throw new Error("Unable to read templates");
        templates[templateType][templateName] = handlebars.compile(
          content);
      });
    });
  });
});

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

userSchema.statics.signup = function(email, password, passwordConfirmation, skipEmail) {
  var schema = this;
  return new promise(function(resolve, reject) {
    if (password !== passwordConfirmation)
      return reject(new errors.ModelInvalid("Password confirmation does not match"));;
    if (!validator.isEmail(email))
      return reject(new errors.ModelInvalid("Invalid Email Address"));
    var params = {
      email: email,
      password: password,
      confirmed: !!skipEmail
    };
    var user = new schema(params);
    user.save().then(function(user) {
      if (!skipEmail) return user.sendConfirmation().then(resolve);
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

userSchema.methods.generateEmail = function(subject, templateName, context) {
  return {
    from_email: "no.reply.voting.app@gmail.com",
    from_name: "Voting App",
    headers: {
      "Reply-To": "no.reply.voting.app@gmail.com"
    },
    html: templates.html[templateName](context),
    text: templates.plain[templateName](context),
    subject: subject,
    to: [{
      "email": this.email,
      "type": "to"
    }]
  };
};

userSchema.methods.sendConfirmation = function() {
  var user = this;
  var confirmationLink = "http://localhost:3000/confirm/" + user.confirmationToken;

  return new promise(function(resolve, reject) {
    if (user.confirmed) return reject(new errors.ModelInvalid("User email already confirmed"));
    mailer.messages.send({
      message: user.generateEmail(
        "Confirm your Voting App email address!", "confirm", {
          confirmationLink: confirmationLink
        }),
      async: false
    }, resolve, function(err) {
      reject(new errors.ApiClientFailure(err.toString()));
    });
  });
};

userSchema.methods.createPoll = function(data) {
  var poll = new Poll({
    published: !!data.published,
    allowOther: !!data.allowOther,
    name: data.name,
    _user: this._id
  });
  _.each(data.options || [], function(option) {
    poll.options.push(new Option({
      value: option
    }));
  });
  return new promise(function(resolve, reject){
    return poll.save().populate('_user').then(resolve).catch(function(err){
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
      _.each(data.options || [], function(option) {
        var updateOption = _.find(poll.options, function(pollOption) {
          return pollOption.value === option.value;
        });
        if (!updateOption) return;
        if (option.hasOwnProperty('published'))
          updateOption.published = option.published;
      });
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
    }).then(function(poll) {
      if (!poll) return reject(new errors.NotFound("Poll not found"));
      return resolve(poll);
    }).catch(function(err) {
      return reject(new errors.DatabaseFailure(err.toString()));
    });
  });
};

userSchema.methods.renderToken = function() {
  return {
    token: this.sessionToken
  };
};

userSchema.methods.renderJson = function() {
  return {
    id: this._id,
    email: this.email
  };
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
var optionSchema = new mongoose.Schema({
  published: {
    type: Boolean,
    default: true
  },
  isOther: {
    type: Boolean,
    default: false
  },
  value: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 0
  }
});

optionSchema.methods.renderJson = function(admin) {
  if (admin) return {
    published: this.published,
    isOther: this.isOther,
    value: this.value,
    count: this.count
  };

  return {
    value: this.value,
    count: this.count
  };
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
  published: {
    type: Boolean,
    default: false
  },
  allowOther: {
    type: Boolean,
    default: false
  },
  options: [optionSchema]
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
      return option.value === response.value;
    });
    if (response.isOther && !option) {
      option = new optionSchema({
        published: false,
        isOther: true,
        value: response.value
      });
      poll.options.push(option);
    } else if (!option) return reject(new errors.ModelInvalid("Invalid Option"));
    option.count++;
    poll.save().then(resolve).catch(function(err) {
      if (err.code === 11000) return reject(new errors.ModelInvalid("Invalid Poll"));
      return reject(new errors.DatabaseFailure(err.toString()));
    });
  });
};

pollSchema.methods.renderJson = function(admin) {
  var poll = this;
  var options = admin ? poll.options : _.filter(poll.options, function(option) {
    return option.published && !option.isOther;
  });
  return {
    id: poll._id,
    user: poll._user.email,
    name: poll.name,
    published: poll.published,
    allowOther: poll.allowOther,
    options: _.map(options, function(option) {
      return option.renderJson(admin);
    })
  };
};

var Option = mongoose.model('Option', optionSchema);
var Poll = mongoose.model('Poll', pollSchema);

module.exports = {
  User: User,
  Option: Option,
  Poll: Poll
};
