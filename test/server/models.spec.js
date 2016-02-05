import request from 'supertest'
import assert from 'assert'
import mongoose from 'mongoose'

if (process.env.ENVIRONMENT !== "test") throw new Error('Run the tests using the test environment flag')

import config from '../../server/config'
import { User, Poll } from '../../server/models'
import { ModelInvalid, ApiClientFailure, NotFound } from '../../server/errors'
import queue from '../../server/queue'
import Factory from './support/factories'

require('./support/setup')

describe('api models', () => {
  describe('User', () => {
    afterEach(done => {
      queue.testMode.clear()
      Poll.remove({}).then(() => User.remove({}).then(done.bind(this, null))).catch(done)
    })

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

    it('creates a new session token on login', done => {
      Factory.create('user', { password: 'test' }, (err, user) => {
        if (err) return done(err)
        assert.notStrictEqual(user.sessionToken, undefined)
        User.login(user.email, 'test').then(loggedInUser => {
          assert.notEqual(loggedInUser.sessionToken, user.sessionToken)
          done()
        }).catch(done)
      })
    })

    it('login returns a NotFound if the email is invalid', done => {
      Factory.create('user', { password: 'test' }, (err, user) => {
        if (err) return done(err)
        User.login('randomemail@blah.com', 'test').then(() => done(new Error('unreachable'))).catch(err => {
          assert(err instanceof NotFound, "Invalid email did not throw a NotFound")
          done()
        }).catch(done)
      })
    })

    if('login returns a ModelInvalid on password mismatch', done => {
      Factory.create('user', { password: 'test' }, (err, user) => {
        if (err) return done(err)
        User.login(user.email, 'nottest').then(() => done(new Error('unreachable'))).catch(err => {
          assert(err instanceof ModelInvalid, "Invalid password did not throw a ModelInvalid")
          done()
        }).catch(done)
      })
    })

    describe('signup', () => {
      it('validates email addresses', done => {
        User.signup('username', 'Hello World', 'test', 'testTest1234', 'testTest1234', true).then(() => {
          done(new Error('unreachable'))
        }).catch(err => {
          assert(err instanceof ModelInvalid, "Invalid email did not throw a ModelInvalid")
          done()
        }).catch(done)
      })

      it('ensures password and confirmation match', done => {
        User.signup('username', 'Hello World', 'test@test.com', 'testTest1234', 'other', true).then(() => {
          done(new Error('unreachable'))
        }).catch(err => {
          assert(err instanceof ModelInvalid, "Password/Confirmation mismatch did not throw a ModelInvalid")
          done()
        }).catch(done)
      })

      it('creates a new record when nothing is wrong with email or password', done => {
        User.signup('username', 'Hello World', 'test@test.com', 'testTest1234', 'testTest1234', true).then(user => {
          assert(user._id instanceof mongoose.Types.ObjectId, "Id is not an ObjectId")
          assert.strictEqual(user.email, 'test@test.com')
          assert(typeof user.password === 'string', "Password is not a String")
          assert(user.confirmed, "User is not confirmed")
          done()
        }).catch(done)
      })

      it('sends an email for confirming users', done => {
        assert.equal(queue.testMode.jobs.length, 0)
        User.signup('username', 'Hello World', 'test@test.com', 'testTest1234', 'testTest1234').then(() => {
          assert.equal(queue.testMode.jobs.length, 1)
          assert.equal(queue.testMode.jobs[0].type, 'email')
          done()
        }).catch(err => {
          done(new Error('unreachable'))
        }).catch(done)
      })
    })
  })
})
