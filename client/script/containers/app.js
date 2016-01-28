import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { IndexLink, Link } from 'react-router'
import { NavDropdown, MenuItem } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { flash, auth } from '../actions'

import NavLink from '../components/nav-link'

class App extends Component {
  constructor(props) {
    super(props)
    this.handleDismissClick = this.handleDismissClick.bind(this)
    this.doLogout = this.doLogout.bind(this)
    this.preventDefault = this.preventDefault.bind(this)
  }

  doLogout(e) {
    e.preventDefault()
    this.props.logout()
  }

  handleDismissClick(e) {
    e.preventDefault()
    this.props.resetMessage()
  }

  preventDefault(e) {
    e.preventDefault()
  }

  renderMessage() {
    const { flash } = this.props

    if (!flash || !flash.type || !flash.message) {
      return null
    }

    return (
      <p style={{padding: 10}} className={`text-${flash.type}`}>
        <b>{flash.message}</b>
        {' '}
        (<a href="#"
            onClick={this.handleDismissClick}>
          Dismiss
        </a>)
      </p>
    )
  }

  header() {
    if (this.props.url === "") {
      return (
        <header className="hero-unit" id="banner">
          <div className="container">
            <div>
              <h1>Voting</h1>
              <p className="lead">Create custom polls with live results.</p>
              <Link to='/signup'>
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
    return ""
  }

  leftNavbar() {
    let admin = ""
    if (this.props.isAuthenticated) {
      admin = (
        <NavDropdown eventKey={3} title="Admin" id="basic-nav-dropdown">
          <LinkContainer to='/new'><MenuItem eventKey={3.1}>New Poll</MenuItem></LinkContainer>
          <LinkContainer to='/profile'><MenuItem eventKey={3.2}>Profile</MenuItem></LinkContainer>
        </NavDropdown>
      )
    }
    return (
      <ul className="nav navbar-nav">
        <NavLink to='/users'>Users</NavLink>
        <NavLink to='/polls'>Polls</NavLink>
        {admin}
      </ul>
    )
  }

  rightNavbar() {
    if (!this.props.isAuthenticated) {
      return (
        <ul className="nav navbar-nav navbar-right">
          <NavLink to='/signup'>Sign Up</NavLink>
          <NavLink to='/login'>Log In</NavLink>
        </ul>
      )
    }
    return (
      <ul className="nav navbar-nav navbar-right">
        <li>
          <p className="navbar-text">Hello <Link to='/profile'>{this.props.currentUser.email}</Link></p>
        </li>
        <li>
          <a href="#" onClick={this.doLogout}>Log Out</a>
        </li>
      </ul>
    )
  }

  render() {
    const { children } = this.props

    const linkTo = this.props.isAuthenticated ? "/profile" : "/"

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
              <IndexLink className="navbar-brand" to={linkTo}>Voting</IndexLink>
            </div>
            <div className="navbar-collapse collapse" id="navbar-main">
              {this.leftNavbar()}
              {this.rightNavbar()}
            </div>
          </div>
        </div>
        {this.renderMessage()}
        {this.header()}
        <div className="container main-container">
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
  flash: PropTypes.shape({
    type: PropTypes.string,
    message: PropTypes.string
  }),
  resetMessage: PropTypes.func.isRequired,
  url: PropTypes.string.isRequired,
  // Injected by React Router
  children: PropTypes.node
}

function mapStateToProps(state) {
  return {
    flash: state.message,
    isAuthenticated: state.auth.isAuthenticated,
    currentUser: state.auth.user,
    url: state.router.location.pathname.substring(1)
  }
}

export default connect(mapStateToProps, {
  resetMessage: flash.resetMessage,
  logout: auth.logout
})(App)
