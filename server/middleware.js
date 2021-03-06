var models = require("./models");

var unauthorized = function(res) {
  return res.status(401).json({
    error: "Unauthorized"
  });
};

var authenticate = function(req, res, next) {
  var token = req.get("x-voting-session");
  if (!token) return unauthorized(res);
  models.User.findOne({
    sessionToken: token
  }).then(function(user) {
    if (!user) return unauthorized(res);
    req.user = user;
    return next();
  }).catch(function(err) {
    return res.status(500).json({
      error: "Something went wrong"
    });
  });
};

module.exports = {
  authenticate: authenticate
};
