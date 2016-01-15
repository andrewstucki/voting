// Based off of: https://github.com/rackt/redux/blob/master/examples/real-world/store/configureStore.js

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./configureStore.prod')
} else {
  module.exports = require('./configureStore.dev')
}
