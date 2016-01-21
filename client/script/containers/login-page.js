import React, { Component } from 'react'
import { connect } from 'react-redux'
import { auth, flash } from '../actions'

class LoginPage extends Component {
  constructor(props) {
    super(props)

    let { query } = this.props.location

    this.doLogin = this.doLogin.bind(this)
    if (query.confirmed) {
      this.props.setMessage(flash.SUCCESS, "Thanks for confirming your account, please log in below")
    }
  }

  doLogin(e) {
    e.preventDefault()
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
            <input className="form-control" id="password" name="password" placeholder="********" type="password" required />
          </div>
          <div className="form-buttons">
            <button className="btn btn-success" type="submit" onClick={this.doLogin}>Submit</button>
          </div>
        </form>
      </div>
    )
  }
}

export default connect(null, {
  login: auth.login,
  setMessage: flash.setMessage
})(LoginPage)
