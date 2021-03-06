// Based off: https://github.com/rackt/redux/blob/master/examples/real-world/containers/Root.dev.js

import React, { Component, PropTypes } from 'react'
import { Provider } from 'react-redux'
import { ReduxRouter } from 'redux-router'
import DevTools from './dev-tools'

export default class Root extends Component {
  render() {
    const { store } = this.props
    return (
      <Provider store={store}>
        <div>
          <ReduxRouter />
          <DevTools />
        </div>
      </Provider>
    )
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired
}
