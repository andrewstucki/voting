import React, { Component } from 'react'
import { connect } from 'react-redux'
import { login } from '../actions'

class LoginPage extends Component {
  constructor(props) {
    super(props)
    this.doLogin = this.doLogin.bind(this)
  }

  doLogin(evt) {
    evt.preventDefault()
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    this.props.login(email, password)
  }

  render() {
    return (
      <div className="col-lg-12 login-form">
        <form name="login">
          <div className="form-group">
            <label htmlFor="email">Enter your email address.</label>
            <input className="form-control" id="email" name="email" placeholder="john.smith@example.com" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Enter your password.</label>
            <input className="form-control" id="password" name="password" placeholder="password" type="password" required />
          </div>
          <div className="form-buttons">
            <button className="btn btn-success" type="submit" onClick={this.doLogin}>Submit</button>
          </div>
        </form>
        <button className="btn btn-success btn-block" id="logout">Logout</button>
      </div>
    )
  }
}

export default connect(null, {
  login
})(LoginPage)
