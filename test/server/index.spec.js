import request from 'supertest'
import mongoose from 'mongoose'
import _ from 'underscore'
import assert from 'assert'

if (process.env.ENVIRONMENT !== "test") throw new Error('Run the tests using the test environment flag')

import config from '../../server/config'
import Factory from './support/factories'
import { User, Poll } from '../../server/models'
import queue from '../../server/queue'

require('./support/setup')

describe('api routes', () => {
  let server

  beforeEach(() => {
    queue.testMode.clear()
    server = require('../../server/index')
  })

  afterEach(() => server.close())

  describe('polls endpoints', () => {
    afterEach(done => Poll.remove({}).then(() => User.remove({}).then(done.bind(this, null))).catch(done))

    it('returns only published polls on get /polls', done =>{
      Factory.createMany('poll', 5, (err, polls) => {
        if (err) return done(err)
        Factory.createMany('poll', { published: false }, 5, err => {
          if (err) return done(err)
          request(server)
            .get('/api/v1/polls')
            .expect('Content-Type', /json/)
            .expect(payload => {
              assert(_.every(payload.body, element => element.hasOwnProperty('id') && typeof element.id === 'string'), 'Not all elements have an id')
              assert(_.every(payload.body, element => element.hasOwnProperty('user') && typeof element.user === 'string'), 'Not all elements have a user')
              const expected = _.map(polls, poll => _.omit(poll.renderJson(), ['id', 'user']))
              const actual = _.map(payload.body, element => _.omit(element, ['id', 'user']))
              assert(_.isEqual(actual, expected), 'Payload did not match')
            })
            .expect(200, done)
        })
      })
    })

    it('returns a 404 for an unpublished poll on /polls/:id', done => {
      Factory.create('poll', { published: false }, (err, poll) => {
        if (err) return done(err)
        request(server)
          .get(`/api/v1/polls/${poll._id}`)
          .expect('Content-Type', /json/)
          .expect(404, done)
      })
    })

    it('returns a published poll on /polls/:id', done => {
      Factory.create('poll', (err, poll) => {
        if (err) return done(err)
        request(server)
          .get(`/api/v1/polls/${poll._id}`)
          .expect('Content-Type', /json/)
          .expect(payload => {
            assert(payload.body.hasOwnProperty('id') && typeof payload.body.id === 'string', 'Payload is missing id')
            assert(payload.body.hasOwnProperty('user') && typeof payload.body.user === 'string', 'Payload is missing user')
            const expected = _.omit(poll.renderJson(), ['id', 'user'])
            const actual = _.omit(payload.body, ['id', 'user'])
            assert(_.isEqual(actual, expected), 'Payload did not match')
          })
          .expect(200, done)
      })
    })

    it('returns a 404 when getting a poll with an invalid id', done => {
      request(server)
        .get(`/api/v1/polls/invalid`)
        .expect('Content-Type', /json/)
        .expect(404, done)
    })

    it('returns a 201 for a successful vote', done => {
      Factory.create('poll', { options: ['foo', 'bar'], allowOther: false }, (err, poll) => {
        if (err) return done(err)
        request(server)
          .post(`/api/v1/polls/${poll._id}/vote`)
          .send({ value: 'foo' })
          .expect('Content-Type', /json/)
          .expect(201, done)
      })
    })

    it('returns a 422 for a vote with an invalid option', done => {
      Factory.create('poll', { options: ['foo', 'bar'], allowOther: false }, (err, poll) => {
        if (err) return done(err)
        request(server)
          .post(`/api/v1/polls/${poll._id}/vote`)
          .send({ value: 'baz' })
          .expect('Content-Type', /json/)
          .expect(422, done)
      })
    })

    it('returns a 201 for a vote with any option if allowOther is set', done => {
      Factory.create('poll', { options: ['foo', 'bar'] }, (err, poll) => {
        if (err) return done(err)
        request(server)
          .post(`/api/v1/polls/${poll._id}/vote`)
          .send({ value: 'baz' })
          .expect('Content-Type', /json/)
          .expect(201, done)
      })
    })

    it('returns a 404 for a vote for an invalid poll id', done => {
      request(server)
        .post(`/api/v1/polls/invalid/vote`)
        .send({ value: 'baz' })
        .expect('Content-Type', /json/)
        .expect(404, done)
    })

    it('returns a 404 for a vote on a poll that is unpublished', done => {
      Factory.create('poll', { published: false }, (err, poll) => {
        if (err) return done(err)
        request(server)
          .post(`/api/v1/polls/${poll._id}/vote`)
          .send({ value: 'baz' })
          .expect('Content-Type', /json/)
          .expect(404, done)
      })
    })

    it('returns a 404 for a vote with a valid objectid, but not matching any records', done => {
      request(server)
        .post(`/api/v1/polls/56a869dec0c4f0af1813db1c/vote`)
        .send({ value: 'baz' })
        .expect('Content-Type', /json/)
        .expect(404, done)
    })
  })

  describe('admin polls endpoints', () => {
    let admin
    const params = {
      name: 'My New Poll',
      published: false,
      allowOther: true,
      options: ['foo', 'bar', 'baz'],
      answers: { will: 'ignore' },
      user: 'test1234',
      _user: 'test1234'
    }

    beforeEach(done => {
      Factory.create('user', (err, user) => {
        if (err) return done(err)
        admin = user
        done()
      })
    })
    afterEach(done => Poll.remove({}).then(() => User.remove({}).then(done.bind(this, null))).catch(done))

    it('returns all polls that the user has created', done => {
      Factory.createMany('poll', { _user: admin }, 5, (err, publishedPolls) => {
        if (err) return done(err)
        Factory.createMany('poll', { published: false, _user: admin }, 5, (err, unpublishedPolls) => {
          if (err) return done(err)
          request(server)
            .get('/api/v1/admin/polls')
            .set('X-Voting-Session', admin.sessionToken)
            .expect('Content-Type', /json/)
            .expect(payload => {
              assert(_.every(payload.body, element => element.hasOwnProperty('id') && typeof element.id === 'string'), 'Not all elements have an id')
              assert(_.every(payload.body, element => element.hasOwnProperty('user') && typeof element.user === 'string'), 'Not all elements have a user')
              const expected = _.map(publishedPolls.concat(unpublishedPolls), poll => _.omit(poll.renderJson(true), ['id', 'user', 'answers']))
              const actual = _.map(payload.body, element => _.omit(element, ['id', 'user', 'answers']))
              assert(_.isEqual(actual, expected), 'Payload did not match')
            })
            .expect(200, done)
        })
      })
    })

    it('returns single published polls/:id that the user has created', done => {
      Factory.create('poll', { _user: admin }, (err, poll) => {
        if (err) return done(err)
        request(server)
          .get(`/api/v1/admin/polls/${poll._id}`)
          .set('X-Voting-Session', admin.sessionToken)
          .expect('Content-Type', /json/)
          .expect(200, done)
      })
    })

    it('returns single unpublished polls/:id that the user has created', done => {
      Factory.create('poll', { published: false, _user: admin }, (err, poll) => {
        if (err) return done(err)
        request(server)
          .get(`/api/v1/admin/polls/${poll._id}`)
          .set('X-Voting-Session', admin.sessionToken)
          .expect('Content-Type', /json/)
          .expect(200, done)
      })
    })

    it('returns 404 for getting polls/:id not owned by the user', done => {
      Factory.create('poll', (err, poll) => {
        if (err) return done(err)
        request(server)
          .get(`/api/v1/admin/polls/${poll._id}`)
          .set('X-Voting-Session', admin.sessionToken)
          .expect('Content-Type', /json/)
          .expect(404, done)
      })
    })

    it('deletes polls/:id owned by the user', done => {
      Factory.create('poll', { _user: admin }, (err, poll) => {
        if (err) return done(err)
        request(server)
          .delete(`/api/v1/admin/polls/${poll._id}`)
          .set('X-Voting-Session', admin.sessionToken)
          .expect('Content-Type', /json/)
          .expect(202, done)
      })
    })

    it('404s for delete polls/:id owned by another user', done => {
      Factory.create('poll', (err, poll) => {
        if (err) return done(err)
        request(server)
          .delete(`/api/v1/admin/polls/${poll._id}`)
          .set('X-Voting-Session', admin.sessionToken)
          .expect('Content-Type', /json/)
          .expect(404, done)
      })
    })

    it('creates a new poll associated with the user on post polls', done => {
      Poll.find({}).then(polls => {
        assert.equal(polls.length, 0)

        request(server)
          .post('/api/v1/admin/polls')
          .set('X-Voting-Session', admin.sessionToken)
          .send(params)
          .expect('Content-Type', /json/)
          .expect(payload => {
            assert(payload.body.hasOwnProperty('id') && typeof payload.body.id == 'string', 'Id missing from payload')
            assert(payload.body.user === admin.email, 'User missing from payload')
            const expected = _.omit(params, ['_user', 'user', 'answers'])
            const actual = _.omit(payload.body, ['user', 'answers', 'id'])
            assert(_.isEqual(actual, expected), 'Payload does not match')
          }).expect(201, err => {
            if (err) return done(err)
            Poll.find({}).then(polls => {
              assert.equal(polls.length, 1)
              done()
            }).catch(done)
          })
      }).catch(done)
    })

    it('404s on patch polls/:id for polls owned by another user', done => {
      Factory.create('poll', (err, poll) => {
        if (err) return done(err)
        request(server)
          .patch(`/api/v1/admin/polls/${poll._id}`)
          .set('X-Voting-Session', admin.sessionToken)
          .send(params)
          .expect('Content-Type', /json/)
          .expect(404, done)
      })
    })

    it('updates the poll on patch polls/:id for polls owned by the user', done => {
      Factory.create('poll', { _user: admin }, (err, poll) => {
        if (err) return done(err)
        Poll.find({}).then(polls => {
          assert.equal(polls.length, 1)
          request(server)
            .patch(`/api/v1/admin/polls/${poll._id}`)
            .set('X-Voting-Session', admin.sessionToken)
            .send(params)
            .expect('Content-Type', /json/)
            .expect(payload => {
              assert(payload.body.hasOwnProperty('id') && typeof payload.body.id == 'string', 'Id missing from payload')
              assert(payload.body.user === admin.email, 'User missing from payload')
              const expected = _.omit(params, ['_user', 'user', 'answers'])
              const actual = _.omit(payload.body, ['user', 'answers', 'id'])
              assert(_.isEqual(actual, expected), 'Payload does not match')
            })
            .expect(200, err => {
              if (err) return done(err)
              Poll.find({}).then(polls => {
                assert.equal(polls.length, 1)
                done()
              }).catch(done)
            })
        })
      })
    })
  })

  describe('lacking authentication on authenticated endpoints', () => {
    it('get profile responds with a 401', (done) => {
      request(server)
        .get('/api/v1/profile')
        .expect('Content-Type', /json/)
        .expect(401, done);
    })

    it('get admin/polls responds with a 401', (done) => {
      request(server)
        .get('/api/v1/admin/polls')
        .expect('Content-Type', /json/)
        .expect(401, done);
    })

    it('post admin/polls responds with a 401', (done) => {
      request(server)
        .post('/api/v1/admin/polls')
        .expect('Content-Type', /json/)
        .expect(401, done);
    })

    it('get admin/polls/:id responds with a 401', (done) => {
      request(server)
        .get('/api/v1/admin/polls/1')
        .expect('Content-Type', /json/)
        .expect(401, done);
    })

    it('patch admin/polls/:id responds with a 401', (done) => {
      request(server)
        .patch('/api/v1/admin/polls/1')
        .expect('Content-Type', /json/)
        .expect(401, done);
    })

    it('delete admin/polls/:id responds with a 401', (done) => {
      request(server)
        .delete('/api/v1/admin/polls/1')
        .expect('Content-Type', /json/)
        .expect(401, done);
    })

    it('delete session responds with a 401', (done) => {
      request(server)
        .delete('/api/v1/session')
        .expect('Content-Type', /json/)
        .expect(401, done);
    })

    it('post confirm/resend responds with a 401', (done) => {
      request(server)
        .post('/api/v1/confirm/resend')
        .expect('Content-Type', /json/)
        .expect(401, done);
    })
  })
})
