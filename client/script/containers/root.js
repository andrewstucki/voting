// Based off: https://github.com/rackt/redux/blob/master/examples/real-world/containers/Root.js

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./root.prod')
} else {
  module.exports = require('./root.dev')
}
