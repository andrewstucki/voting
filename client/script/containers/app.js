import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { IndexLink, Link } from 'react-router'
import { resetErrorMessage } from '../actions'

import NavLink from '../components/nav-link'

console.log(NavLink)

class App extends Component {
  constructor(props) {
    super(props)
    this.handleDismissClick = this.handleDismissClick.bind(this)
  }

  handleDismissClick(e) {
    this.props.resetErrorMessage()
    e.preventDefault()
  }

  renderErrorMessage() {
    const { errorMessage } = this.props
    if (!errorMessage) {
      return null
    }

    return (
      <p style={{ backgroundColor: '#e99', padding: 10 }}>
        <b>{errorMessage}</b>
        {' '}
        (<a href="#"
            onClick={this.handleDismissClick}>
          Dismiss
        </a>)
      </p>
    )
  }

  render() {
    const { children } = this.props
    let header = "";
    if (this.props.url === "") {
      header = (
        <header className="hero-unit" id="banner">
          <div className="container">
            <div>
              <h1>Voting</h1>
              <p className="lead">Create custom polls with live results.</p>
              <Link to='signup'>
                <button className="btn btn-lg btn-success main-signup">Sign Up</button>
              </Link>
            </div>
            <div className="hide">
              <h1>Dashboard</h1>
              <p className="lead">What would you like to do today?</p>
              <button className="btn btn-lg btn-success">New Poll</button>
              <button className="btn btn-lg btn-primary">My Polls</button>
            </div>
          </div>
        </header>
      )
    }

    return (
      <div>
        <div className="navbar navbar-default navbar-static-top">
          <div className="container">
            <div className="navbar-header">
              <button className="navbar-toggle" type="button">
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <IndexLink className="navbar-brand" to="/">Voting</IndexLink>
            </div>
            <div className="navbar-collapse collapse" id="navbar-main">
              <ul className="nav navbar-nav">
                <NavLink to='users'>Users</NavLink>
                <NavLink to='polls'>Polls</NavLink>
                <li>
                  <a href="#">Admin</a>
                </li>
              </ul>
              <ul className="nav navbar-nav navbar-right">
                <NavLink to='polls'>Sign Up</NavLink>
                <NavLink to='login'>Log In</NavLink>
                <li className="hide">
                  <p className="navbar-text">Hello</p>
                </li>
                <li className="hide">
                  <a href="#">Log Out</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {this.renderErrorMessage()}
        {header}
        <div className="container">
          <div className="row">
            {children}
          </div>
        </div>
      </div>
    )
  }
}

App.propTypes = {
  // Injected by React Redux
  errorMessage: PropTypes.string,
  resetErrorMessage: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
  // Injected by React Router
  children: PropTypes.node
}

function mapStateToProps(state) {
  return {
    errorMessage: state.errorMessage,
    url: state.router.location.pathname.substring(1)
  }
}

export default connect(mapStateToProps, {
  resetErrorMessage
})(App)
