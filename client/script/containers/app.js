import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { resetErrorMessage } from '../actions'

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
    let block = children;
    let header = "";
    if (this.props.url === "") {
      header = (
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
      block = (
        <div className="col-lg-12 home">
          <div className="col-lg-4">
            <i className="fa fa-bolt"></i>
            <h2>Live Results</h2>
            <p>Live graphs show your poll results immediately in an easy to understand format. One graph will not provide the whole picture, that's why we provide multiple graph types to better describe your results.</p>
          </div>
          <div className="col-lg-4">
            <i className="fa fa-globe"></i>
            <h2>Works Everywhere</h2>
            <p>Traditional desktop computers now represent only 30% of Internet traffic. Your poll must work on the tablets, smart phones, netbooks and notebooks that your visitors are using. Our responsive designs do just that.</p>
          </div>
          <div className="col-lg-4">
            <i className="fa fa-facebook"></i>
            <h2>Social Integration</h2>
            <p>Free integrated facebook or traditional comments allow your poll voters to provide immediate feedback and discuss results. Social share buttons encourage your poll voters to help spread the word.</p>
          </div>
        </div>
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
              <Link className="navbar-brand" to='/'>Voting</Link>
            </div>
            <div className="navbar-collapse collapse" id="navbar-main">
              <ul className="nav navbar-nav">
                <li className="active">
                  <Link to='/'>Home</Link>
                </li>
                <li>
                  <Link to='/users'>Users</Link>
                </li>
                <li>
                  <Link to='/polls'>Polls</Link>
                </li>
                <li>
                  <a href="#">Admin</a>
                </li>
              </ul>
              <ul className="nav navbar-nav navbar-right">
                <li>
                  <Link to='/signup'>Sign Up</Link>
                </li>
                <li>
                  <Link to='/login'>Log In</Link>
                </li>
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
            {block}
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
