import nock from 'nock'
import mongoose from 'mongoose'
import assert from 'assert'

import config from '../../../server/config'
import email from '../../../server/workers/email'
import { User, Poll } from '../../../server/models'

import Factory from '../support/factories'

require('../support/setup')

describe('api email worker', () => {
  afterEach(done => Poll.remove({}).then(() => User.remove({}).then(done.bind(this, null))).catch(done))

  it('calls the callback with errors when mandrill returns an error', done => {
    let mandrill = nock('https://mandrillapp.com')
      .post('/api/1.0/messages/send.json')
      .reply(401, {
        'error': 'test'
      })

    Factory.create('user', { confirmed: false }, (err, user) => {
      if (err) return done(err)
      email({
        data: {
          user_id: user._id
        }
      }, err => {
        assert(err !== undefined, 'Error is undefined')
        mandrill.done()
        done()
      }).catch(done)
    })
  })

  it('calls the callback with errors when the user is already confirmed', done => {
    Factory.create('user', { confirmed: true }, (err, user) => {
      if (err) return done(err)
      email({
        data: {
          user_id: user._id
        }
      }, err => {
        assert(err !== undefined, 'Error is undefined')
        done()
      }).catch(done)
    })
  })

  it('calls the callback with errors when there is no matching user id', done => {
    email({
      data: {
        user_id: '56a869dec0c4f0af1813db1c'
      }
    }, err => {
      assert(err !== undefined, 'Error is undefined')
      done()
    }).catch(done)
  })

  it('calls the callback with an error when mandrill fails', done => {
    let mandrill = nock('https://mandrillapp.com')
      .post('/api/1.0/messages/send.json')
      .reply(200, [{
        status: 'failed'
      }])

    Factory.create('user', { confirmed: false }, (err, user) => {
      if (err) return done(err)
      email({
        data: {
          user_id: user._id
        }
      }, err => {
        assert(err !== undefined, 'Error is undefined')
        mandrill.done()
        done()
      }).catch(done)
    })
  })

  it('calls the callback with no arguments when mandrill succeeds', done => {
    let mandrill = nock('https://mandrillapp.com')
      .post('/api/1.0/messages/send.json')
      .reply(200, [{
        status: 'sent'
      }])

    Factory.create('user', { confirmed: false }, (err, user) => {
      if (err) return done(err)
      email({
        data: {
          user_id: user._id
        }
      }, err => {
        assert(err === undefined, 'Unexpected error')
        mandrill.done()
        done()
      }).catch(done)
    })
  })
})
