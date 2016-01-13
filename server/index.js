require('dotenv').load();

var express = require('express');
var bodyParser = require('body-parser');

var models = require('./models');
var config = require('./config');

var app = express();
var jsonParser = bodyParser.json();
var port = process.env.PORT || config.port;

app.use(express.static('public'));

// application core

// user creation and authentication
app.post("/session", jsonParser, function(req, res) {
  if (!req.body) return res.status(401).json({
    error: "Invalid credentials"
  });
  models.User.login(req.body.email, req.body.password).then(function(user) {
    return res.status(201).json({
      token: user.sessionToken
    });
  }).catch(function(err) {
    console.log(err);
    return res.status(401).json({
      error: "Unable to log in with given credentials"
    });
  });
});

app.delete("/session", function(req, res) {
  var token = req.get("x-voting-session");
  if (!token) return res.status(422).json({
    error: "Missing session token"
  });
  models.User.logout(token).then(function(user) {
    return res.status(204).send("");
  }).catch(function(err) {
    console.log(err);
    return res.status(400).json({
      error: "Unable to clear session"
    });
  });
});

app.get("/confirm/:token", function(req, res) {
  models.User.confirm(req.params.token).then(function(user) {
    return res.status(200).send(
      "Thanks for verifying your email address " + user.email + "!");
  }).catch(function(err) {
    console.log(err);
    return res.status(401).send("We were unable to confirm your token");
  });
});

app.post("/signup", jsonParser, function(req, res) {
  console.log(req.get('Content-Type'));
  if (!req.body) return res.status(422).json({
    error: "Invalid parameters"
  });
  console.log(req.body);
  models.User.signup(req.body.email, req.body.password, req.body.password_confirmation)
    .then(function(user) {
      return res.status(201).json({
        email: user.email
      });
    }).catch(function(err) {
      console.log(err);
      return res.status(422).json({
        error: err
      });
    });
});

// poll creation
app.get("/voting", function(req, res) {
  res.send(200, "hello world!");
  // models.Search.find({}, function(err, searches) {
  //   if (err) res.status(500).json({
  //     error: "Sorry, something went wrong"
  //   });
  //   else res.json(searches.map(function(search) {
  //     return {
  //       term: search.term,
  //       when: search.when
  //     };
  //   }));
  // });
});

module.exports = app.listen(port, function() {
  if (config.environment !== "test")
    console.log('Voting app listening on port ' + port + '!');
});
