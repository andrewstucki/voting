var fs = require('fs');

var mandrill = require('mandrill-api/mandrill');
var handlebars = require('handlebars');
var _ = require('underscore');

var User = require('../models').User;

/* istanbul skip if */
if (!process.env.MANDRILL_APIKEY && process.env.ENVIRONMENT !== "test") throw new Error("Mandrill API key required!");

var baseUrl = process.env.BASE_URL || "http://localhost:3000";

var mailer = new mandrill.Mandrill(process.env.MANDRILL_APIKEY);
var templates = {
  html: {},
  plain: {}
};

_.each(["html", "plain"], function(templateType) {
  var dirname = __dirname + "/../emails/" + templateType + "/";
  fs.readdir(dirname, function(err, filenames) {
    /* istanbul skip if */
    if (err) throw new Error("Unable to read template directory");
    _.each(filenames, function(filename) {
      fs.readFile(dirname + filename, 'utf-8', function(err, content) {
        var templateName = filename.split(".")[0];
        /* istanbul skip if */
        if (err) throw new Error("Unable to read templates");
        templates[templateType][templateName] = handlebars.compile(content);
      });
    });
  });
});

var generateEmail = function(user, subject, templateName, context) {
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
      "email": user.email,
      "type": "to"
    }]
  };
};

module.exports = function(job, done) {
  return User.findOne({
    _id: job.data.user_id,
    confirmed: false
  }).then(function(user){
    if (!user) return done(new Error('user invalid'));
    var confirmationLink = baseUrl + "/api/v1/confirm/" + user.confirmationToken;
    mailer.messages.send({
      message: generateEmail(user, "Confirm your Voting App email address!", "confirm", {
          confirmationLink: confirmationLink
        }),
      async: false
    }, function(result) {
      if (result[0].status !== 'sent') return done(new Error('send failed: ' + result.status));
      done();
    }, done);
  }).catch(done);
};
