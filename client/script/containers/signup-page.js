import React, { Component } from 'react'
import { connect } from 'react-redux'
import { auth } from '../actions'

class SignupPage extends Component {
  constructor(props) {
    super(props)
    this.doSignup = this.doSignup.bind(this)
  }

  doSignup(e) {
    e.preventDefault()
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const confirmation = document.getElementById("password_confirmation").value
    this.props.signup(email, password, confirmation)
  }

  render() {
    return (
      <div className="col-lg-12 signup-form">
        <form name="signup">
          <div className="form-group">
            <label htmlFor="email">Enter your email address.</label>
            <input className="form-control" id="email" name="email" placeholder="john.smith@example.com" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Enter your desired password.</label>
            <input className="form-control" id="password" name="password" placeholder="********" type="password" required />
          </div>
          <div className="form-group">
            <label htmlFor="password_confirmation">Confirm your password.</label>
            <input className="form-control" id="password_confirmation" name="password_confirmation" placeholder="********" type="password" required />
          </div>
          <div className="form-buttons">
            <button className="btn btn-success" type="submit" onClick={this.doSignup}>Submit</button>
          </div>
        </form>
      </div>
    )
  }
}

export default connect(null, {
  signup: auth.signup
})(SignupPage)
