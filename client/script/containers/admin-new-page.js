import React, { Component } from 'react'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'
import { createPoll } from '../actions'

import PollForm from '../components/poll-form'

class AdminNewPage extends Component {
  constructor(props) {
    super(props)
    this.submitForm = this.submitForm.bind(this)
  }

  submitForm(poll) {
    let props = this.props
    this.props.createPoll(poll, function(newPollArray) {
      let newPoll = Object.values(newPollArray)[0]
      props.dispatch(pushState(null, `/edit/${newPoll.id}`))
    })
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
