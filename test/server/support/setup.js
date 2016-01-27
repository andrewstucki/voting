import mongoose from 'mongoose'

import config from '../../../server/config'
import queue from '../../../server/queue'

before(done => {
  queue.testMode.enter()
  if (mongoose.connection.db) return done()
  mongoose.connect(config.db, done)
})

after(done => {
  queue.testMode.exit()
  mongoose.connection.db.dropDatabase(() => mongoose.connection.close(done))
})
