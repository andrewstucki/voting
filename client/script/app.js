// Based off: https://github.com/rackt/redux/blob/master/examples/real-world/index.js

import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import Root from './containers/root'
import configureStore from './store/configureStore'

const store = configureStore()

render(
  <Root store={store} />,
  document.getElementById('app')
)
