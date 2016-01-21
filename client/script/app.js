// Based off: https://github.com/rackt/redux/blob/master/examples/real-world/index.js

import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import Root from './containers/root'
import configureStore from './store/configureStore'
import { api } from './actions'

function initializeApplication(user) {
  let store
  if (user) {
    store = configureStore({
      auth: { isAuthenticated: true, user: Object.assign({}, user, { polls: [] }) },
    })
  } else {
    store = configureStore()
  }

  render(
    <Root store={store} />,
    document.getElementById('app')
  )
}

const token = localStorage.getItem("token")
api('/profile', { authentication: token }).then(initializeApplication).catch(err => initializeApplication())
