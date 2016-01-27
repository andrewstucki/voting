var kue = require('kue');

module.exports = kue.createQueue({
  redis: process.env.REDIS_URI || 'redis://localhost:6379'
});
