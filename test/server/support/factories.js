import Factory from 'factory-girl'
import hat from 'hat'
import mongoose from 'mongoose'

import { User, Poll } from '../../../server/models'

Factory.define('user', User, {
  email: Factory.sequence(n => `user${n}@example.com`),
  password: 'password',
  confirmed: true,
  confirmationToken: () => hat(),
  sessionToken: () => hat()
})

export default Factory
