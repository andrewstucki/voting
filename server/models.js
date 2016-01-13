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

console.log(process.env.MANDRILL_APIKEY);
var mailer = new mandrill.Mandrill(process.env.MANDRILL_APIKEY);
var templates = {html: {}, plain: {}};

_.each(["html", "plain"], function(templateType) {
  var dirname = __dirname + "/emails/" + templateType + "/";
  fs.readdir(dirname, function(err, filenames) {
    if (err) throw new Error("Unable to read template directory");
    _.each(filenames, function(filename) {
      fs.readFile(dirname + filename, 'utf-8', function(err, content) {
        var templateName = filename.split(".")[0];
        if (err) throw new Error("Unable to read templates");
        templates[templateType][templateName] = handlebars.compile(content);
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

userSchema.methods.generateEmail = function(subject, templateName, context) {
  console.log(templateName, subject, templates.plain[templateName]);
  console.log(templates.plain[templateName](context));
  return {
    from_email: "andrew.stucki@gmail.com",
    from_name: "Voting App",
    headers: {
      "Reply-To": "andrew.stucki+reply@gmail.com"
    },
    html: templates.html[templateName](context),
    text: templates.plain[templateName](context),
    subject: subject,
    to: [{
      "email": user.email,
      "type": "to"
    }]
  };
};

userSchema.methods.sendConfirmation = function() {
  console.log("sending confirmation");
  var user = this;
  var confirmationLink = "http://localhost:3000/confirm/" + user.confirmationToken;

  return new promise(function(resolve, reject) {
    if (user.confirmed) return reject("User email already confirmed");
    console.log(user.generateEmail("Confirm your Voting App email address!", "confirm", {confirmationLink: confirmationLink}));
    mailer.messages.send({
      message: user.generateEmail("Confirm your Voting App email address!", "confirm", {confirmationLink: confirmationLink}),
      async: false
    }, function(result) {
      console.log("sent message");
      console.log(result);
      return resolve(result);
    }, function(err) {
      console.log("error sending message");
      console.log(err);
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
