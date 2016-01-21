import React, { Component } from 'react'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'
import { admin } from '../actions'

import PollForm from '../components/poll-form'

class AdminNewPage extends Component {
  constructor(props) {
    super(props)
    this.submitForm = this.submitForm.bind(this)
  }

  submitForm(poll) {
    let props = this.props
    this.props.createPoll(poll).then(newPoll => {
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
  createPoll: admin.createPoll
})(AdminNewPage)
