import React, { Component, PropTypes } from 'react';
import { Router, Route } from 'react-router';
import Hello from './components/hello';

export default class Root extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired
  };

  render() {
    const { history } = this.props;
    return (
      <Router history={history}>
        <Route name='hello' path='/' component={Hello} />
      </Router>
    );
  };
};
