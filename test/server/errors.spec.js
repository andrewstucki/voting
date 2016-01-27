import assert from 'assert'

import { ApiClientFailure, NotFound, ModelInvalid, DatabaseFailure, Unauthorized } from '../../server/errors'

describe('api errors', () => {
  describe('ApiClientFailure', () => {
    it('is an instanceof Error', done => {
      const err = new ApiClientFailure("test")
      assert(err instanceof Error)
      done()
    })

    it('can call toString', done => {
      const err = new ApiClientFailure("test")
      assert.equal(err.toString(), "test")
      done()
    })
  })

  describe('NotFound', () => {
    it('is an instanceof Error', done => {
      const err = new NotFound("test")
      assert(err instanceof Error)
      done()
    })

    it('can call toString', done => {
      const err = new NotFound("test")
      assert.equal(err.toString(), "test")
      done()
    })
  })

  describe('ModelInvalid', () => {
    it('is an instanceof Error', done => {
      const err = new ModelInvalid("test")
      assert(err instanceof Error)
      done()
    })

    it('can call toString', done => {
      const err = new ModelInvalid("test")
      assert.equal(err.toString(), "test")
      done()
    })
  })

  describe('DatabaseFailure', () => {
    it('is an instanceof Error', done => {
      const err = new DatabaseFailure("test")
      assert(err instanceof Error)
      done()
    })

    it('can call toString', done => {
      const err = new DatabaseFailure("test")
      assert.equal(err.toString(), "test")
      done()
    })
  })

  describe('Unauthorized', () => {
    it('is an instanceof Error', done => {
      const err = new Unauthorized("test")
      assert(err instanceof Error)
      done()
    })

    it('can call toString', done => {
      const err = new Unauthorized("test")
      assert.equal(err.toString(), "test")
      done()
    })
  })
})
