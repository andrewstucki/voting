import request from 'supertest'
import mongoose from 'mongoose'
import assert from 'assert'
import nock from 'nock'

if (process.env.ENVIRONMENT !== "test") throw new Error('Run the tests using the test environment flag')

import config from '../../server/config'
import { User } from '../../server/models'
import { ModelInvalid, ApiClientFailure } from '../../server/errors'
import Factory from './support/factories'

describe('api models', () => {
  describe('User', () => {
    before(done => {
      if (mongoose.connection.db) return done()
      mongoose.connect(config.db, done)
    })

    after(done => mongoose.connection.db.dropDatabase(() => mongoose.connection.close(done)))
    beforeEach(done => mongoose.connection.db.dropDatabase(done))

    it('clears the session token on logout', done => {
      Factory.create('user', (err, user) => {
        if (err) return done(err)
        assert.notStrictEqual(user.sessionToken, undefined)
        user.logout().then(saved => {
          assert.strictEqual(saved.sessionToken, undefined)
          done()
        }).catch(done)
      })
    })

    describe('signup', () => {
      it('validates email addresses', done => {
        User.signup('test', 'test', 'test', true).then(() => {
          done(new Error('unreachable'))
        }).catch(err => {
          assert(err instanceof ModelInvalid, "Invalid email did not throw a ModelInvalid")
          done()
        }).catch(done)
      })

      it('ensures password and confirmation match', done => {
        User.signup('test@test.com', 'test', 'other', true).then(() => {
          done(new Error('unreachable'))
        }).catch(err => {
          assert(err instanceof ModelInvalid, "Password/Confirmation mismatch did not throw a ModelInvalid")
          done()
        }).catch(done)
      })

      it('creates a new record when nothing is wrong with email or password', done => {
        User.signup('test@test.com', 'test', 'test', true).then(user => {
          assert(user._id instanceof mongoose.Types.ObjectId, "Id is not an ObjectId")
          assert.strictEqual(user.email, 'test@test.com')
          assert(typeof user.password === 'string', "Password is not a String")
          assert(user.confirmed, "User is not confirmed")
          done()
        }).catch(done)
      })

      it('sends an email for confirming users', done => {
        let mandrill = nock('https://mandrillapp.com')
          .post('/api/1.0/messages/send.json')
          .reply(200)

        User.signup('test@test.com', 'test', 'test').then(user => {
          assert(user._id instanceof mongoose.Types.ObjectId, "Id is not an ObjectId")
          assert.strictEqual(user.email, 'test@test.com')
          assert(typeof user.password === 'string', "Password is not a String")
          assert(!user.confirmed, "User is not confirmed")
          mandrill.done()
          done()
        }).catch(done)
      })

      it('throws an ApiClientFailure error if email sending fails', done => {
        let mandrill = nock('https://mandrillapp.com')
          .post('/api/1.0/messages/send.json')
          .reply(401, {
            'error': 'test'
          })

        User.signup('test@test.com', 'test', 'test').then(() => {
          mandrill.done()
          done(new Error('unreachable'))
        }).catch(err => {
          assert(err instanceof ApiClientFailure, 'Error is not an ApiClientFailure')
          mandrill.done()
          done()
        }).catch(done)
      })
    })
  })
})
