import React, { Component } from 'react'
import { connect } from 'react-redux'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { auth, flash } from '../actions'

const validation = {
  email: (email, state) => {
    return {
      valid: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email),
      message: "Invalid email address."
    }
  },
  username: (username, state) => {
    return {
      valid: /^[A-Za-z0-9]{5,15}$/.test(username),
      message: "Username must be between 5 and 15 characters and may only contain lower case letters, upper case letters, and numbers."
    }
  },
  password: (password, state) => {
    return {
      valid: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password),
      message: "Password must be at least 8 characters and must include at least one upper case letter, one lower case letter, and one number."
    }
  },
  confirmation: (confirmation, state) => {
    return {
     valid: confirmation !== '' && state.password === confirmation,
     message: "Confirmation must not be empty and must match password."
    }
  }
}

class SignupPage extends Component {
  constructor(props) {
    super(props)
    this.doSignup = this.doSignup.bind(this)
    this.updateState = this.updateState.bind(this)
    this.state = {
      email: '',
      name: '',
      username: '',
      password: '',
      confirmation: '',
      submitted: false
    }
  }

  doSignup(e) {
    e.preventDefault()
    let errors = []
    for (let validator in validation) {
      const { valid, message } = validation[validator](this.state[validator], this.state)
      if (!valid) errors.push(message)
    }
    if (errors.length === 0) return this.props.signup(this.state.username, this.state.name, this.state.email, this.state.password, this.state.confirmation)
    this.props.setMessage(flash.ERROR, "There were problems in the form, see below for errors.")
    this.setState(Object.assign({}, this.state, {submitted: true}))
  }

  updateState(e) {
    let newState = {}
    newState[e.target.id] = e.target.value
    this.setState(Object.assign({}, this.state, newState))
  }

  generateInput(name, message, placeholder, value, submitted = false, type="text", required = false) {
    let hasValidation = false
    let valid = false
    let validationValue = {}
    let classNames = "form-group"
    let feedback = ""
    let smFeedback = ""
    let label = <label htmlFor={name} className="control-label">{message}</label>

    if (validation.hasOwnProperty(name)) hasValidation = true
    if ((value !== '' || submitted) && hasValidation) {
      validationValue = validation[name](value, this.state)
      if (validationValue.valid) {
        classNames += " has-success"
        feedback = <span className="glyphicon glyphicon-ok form-control-feedback" aria-hidden="true"></span>
        smFeedback = <span id={`${name}-success`} className="sr-only">(success)</span>
      } else {
        let tooltip = <Tooltip id={`${name}-feedback`}>{validationValue.message}</Tooltip>
        label = (
          <OverlayTrigger placement="right" overlay={tooltip}>
            {label}
          </OverlayTrigger>
        )
        classNames += " has-error"
        feedback = <span className="form-control-feedback glyphicon glyphicon-remove" aria-hidden="true"></span>
        smFeedback = <span id={`${name}-success`} className="sr-only">({validationValue.message})</span>
      }
      classNames += " has-feedback"
    }

    return (
      <div className={classNames}>
        {label}
        <input type={type} className="form-control" id={name} name={name} placeholder={placeholder} value={value} onChange={this.updateState} required={required} aria-describedby={`${name}-success`} />
        {feedback}
        {smFeedback}
      </div>
    )
  }

  render() {
    const { email, name, username, password, confirmation, submitted } = this.state
    return (
      <div className="col-lg-12 signup-form">
        <form name="signup">
          {this.generateInput('email', 'Enter your email address.', 'john.smith@example.com', email, submitted, 'text', true)}
          {this.generateInput('name', 'Enter your name.', 'John Smith', name)}
          {this.generateInput('username', 'Enter your desired username.', 'johnsmith', username, submitted, 'text', true)}
          {this.generateInput('password', 'Enter your desired password.', '********', password, submitted, 'password', true)}
          {this.generateInput('confirmation', 'Confirm your password.', '********', confirmation, submitted, 'password', true)}
          <div className="form-buttons">
            <button className="btn btn-block btn-success" type="submit" onClick={this.doSignup}>Submit</button>
          </div>
        </form>
      </div>
    )
  }
}

export default connect(null, {
  signup: auth.signup,
  setMessage: flash.setMessage
})(SignupPage)
