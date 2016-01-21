let fs = require('fs')
let request = require('supertest')

process.env.ENVIRONMENT = "test"

let config = require("../../server/config")

describe('api', () => {
  let server

  beforeEach(() => server = require('../../server/index'))

  afterEach(() => server.close())

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
