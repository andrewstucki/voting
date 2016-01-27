var kue = require('kue');

module.exports = kue.createQueue({
  redis: process.env.REDIS_URL || 'redis://localhost:6379'
});
