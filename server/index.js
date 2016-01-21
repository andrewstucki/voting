require('dotenv').load();

var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var path = require('path');

var models = require('./models');
var config = require('./config');
var middleware = require('./middleware');
var errors = require('./errors');

var app = express();
var jsonParser = bodyParser.json();
var port = process.env.PORT || config.port;

app.use(express.static('public'));
app.get(/^\/(users|login|signup|polls|edit|new|profile).*/, function(req, res) {
  res.sendFile(path.resolve(__dirname + '/../public/index.html'));
});

var router  = express.Router();
app.use('/api/v1', router);

// application core

var unauthorized = function(res, message) {
  return res.status(401).json({
    error: message || "Unauthorized"
  });
};

var notFound = function(res, message) {
  return res.status(404).json({
    error: message || "Not Found"
  });
};

var invalid = function(res, message) {
  return res.status(422).json({
    error: message || "Invalid"
  });
};

var internalError = function(res) {
  return res.status(500).json({
    error: "Something went wrong"
  });
}

var handleError = function(res, err) {
  if (typeof err === "string") {
    console.log(err);
  } else {
    console.log(err.toString());
  }
  if (err instanceof errors.NotFound) return notFound(res, err.toString());
  if (err instanceof errors.ModelInvalid) return invalid(res, err.toString());
  if (err instanceof errors.Unauthorized) return unauthorized(res, err.toString());
  return internalError(res);
};

// user creation and authentication
router.post("/session", jsonParser, function(req, res) {
  if (!req.body) return unauthorized(res);
  models.User.login(req.body.email, req.body.password).then(function(user) {
    return res.status(201).json(user.renderToken());
  }).catch(handleError.bind(this, res));
});

router.delete("/session", middleware.authenticate, function(req, res) {
  req.user.logout().then(function(user) {
    return res.status(202).send({});
  }).catch(handleError.bind(this, res));
});

router.get("/profile", middleware.authenticate, function(req, res) {
  return res.status(200).json(req.user.renderToken());
});

router.get("/users", function(req, res) {
  models.User.find({}).then(function(users) {
    return res.status(200).json(_.map(users, function(user) {
      return user.renderJson();
    }));
  }).catch(handleError.bind(this, res));
});

router.get("/users/:id", function(req, res) {
  models.User.findById(req.params.id).then(function(user) {
    if (!user) return notFound(res);
    return res.status(200).json(user.renderJson());
  }).catch(handleError.bind(this, res));
});

router.get("/confirm/:token", function(req, res) {
  models.User.confirm(req.params.token).then(function(user) {
    return res.redirect('/login?confirmed=true');
  }).catch(handleError.bind(this, res));
});

router.post("/confirm/resend", middleware.authenticate, function(req, res) {
  req.user.sendConfirmation().then(function() {
    return res.status(201).json({
      message: "Confirmation message sent to: " + req.user.email
    });
  }).catch(handleError.bind(this, res));
});

router.post("/signup", jsonParser, function(req, res) {
  if (!req.body) return invalid(res);
  models.User.signup(req.body.email, req.body.password, req.body.confirmation).then(function(user) {
    return res.status(201).json({
      message: "Confirmation message sent to: " + user.email
    });
  }).catch(handleError.bind(this, res));
});

// admin
router.post('/admin/polls', jsonParser, middleware.authenticate, function(req, res) {
  req.user.createPoll(req.body).then(function(poll) {
    return res.status(201).json(poll.renderJson(true));
  }).catch(handleError.bind(this, res));
});

router.get('/admin/polls', middleware.authenticate, function(req, res) {
  req.user.getPolls().then(function(polls) {
    return res.status(200).json(_.map(polls, function(poll) {
      return poll.renderJson(true);
    }));
  }).catch(handleError.bind(this, res));
});

router.get('/admin/polls/:id', middleware.authenticate, function(req, res) {
  req.user.getPoll(req.params.id).then(function(poll) {
    return res.status(200).json(poll.renderJson(true));
  }).catch(handleError.bind(this, res));
});

router.patch('/admin/polls/:id', jsonParser, middleware.authenticate, function(req, res) {
  req.user.updatePoll(req.params.id, req.body).then(function(poll) {
    return res.status(200).json(poll.renderJson(true));
  }).catch(handleError.bind(this, res));
});

router.delete('/admin/polls/:id', middleware.authenticate, function(req, res) {
  req.user.deletePoll(req.params.id).then(function(poll) {
    return res.status(202).send({});
  }).catch(handleError.bind(this, res));
});

// polls
router.get('/polls', function(req, res) {
  models.Poll.published().then(function(polls) {
    return res.status(200).json(_.map(polls, function(poll) {
      return poll.renderJson();
    }));
  }).catch(handleError.bind(this, res));
});

router.get('/polls/:id', function(req, res) {
  models.Poll.findOne({
    _id: req.params.id,
    published: true
  }).populate('_user').then(function(poll) {
    if (!poll) return notFound(res, "Poll not found");
    return res.status(200).json(poll.renderJson());
  }).catch(function(err) {
    console.log(err.toString());
    return internalError(res);
  });
});

router.post('/polls/:id/vote', jsonParser, function(req, res) {
  models.Poll.findOne({
    _id: req.params.id
  }).then(function(poll) {
    if (!poll) return notFound(res, "Poll not found");
    return poll.vote(req.body.value).then(function(poll) {
      return res.status(201).json({
        message: "Thank you for voting"
      });
    }).catch(handleError.bind(this, res));
  }).catch(function(err) {
    console.log(err.toString());
    return internalError(res);
  });
});

module.exports = app.listen(port, function() {
  if (config.environment !== "test") console.log('Voting app listening on port ' + port + '!');
});
