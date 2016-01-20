import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createPoll } from '../actions'

import PollForm from '../components/poll-form'

class AdminNewPage extends Component {
  constructor(props) {
    super(props)
    this.submitForm = this.submitForm.bind(this)
  }

  submitForm(poll) {
    this.props.createPoll(poll)
  }

  render() {
    return (
      <PollForm poll={{}} onSubmit={this.submitForm} />
    )
  }
}

export default connect(null, {
  createPoll
})(AdminNewPage)
