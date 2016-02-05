import Factory from 'factory-girl'
import hat from 'hat'
import mongoose from 'mongoose'

import { User, Poll } from '../../../server/models'

Factory.define('user', User, {
  email: Factory.sequence(n => `user${n}@example.com`),
  username: Factory.sequence(n => `username${n}`),
  name: Factory.sequence(n => `User ${n}`),
  password: 'password',
  confirmed: true,
  confirmationToken: () => hat(),
  sessionToken: () => hat()
})

Factory.define('poll', Poll, {
  _user: Factory.assoc('user', '_id'),
  name: Factory.sequence(n => `Poll ${n}`),
  description: 'This is a description',
  published: true,
  allowOther: true,
  answers: {},
  options: []
})

export default Factory
