// Based off: https://github.com/rackt/redux/blob/master/examples/real-world/index.js

import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import Root from './containers/root'
import configureStore from './store/configureStore'
import { callApi } from './middleware/api'

function initializeApplication(user) {
  let store
  if (user) {
    store = configureStore({
      auth: { isAuthenticated: true, user: user },
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
callApi('/profile', 'user', { 'X-Voting-Session': token || '' }).then(function(data) {
  initializeApplication(Object.values(data.user)[0])
}).catch(function(err) {
  initializeApplication()
})
