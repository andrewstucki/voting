import React, { Component } from 'react'

export default class SignupPage extends Component {
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
            <input className="form-control" id="password" name="password" placeholder="password" type="password" required />
          </div>
          <div className="form-group">
            <label htmlFor="password_confirmation">Confirm your password.</label>
            <input className="form-control" id="password_confirmation" name="password_confirmation" placeholder="password" type="password" required />
          </div>
          <div className="form-buttons">
            <button className="btn btn-success" type="submit">Submit</button>
          </div>
        </form>
      </div>
    )
  }
}
