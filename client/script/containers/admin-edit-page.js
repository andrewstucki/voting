import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { pushState } from 'redux-router'
import { admin } from '../actions'
import PollForm from '../components/poll-form'

class AdminEditPage extends Component {
  constructor(props) {
    super(props)
    this.props.loadPoll(this.props.params.id)
    this.submitForm = this.submitForm.bind(this)
    this.deletePoll = this.deletePoll.bind(this)
  }

  submitForm(poll) {
    this.props.updatePoll(poll)
  }

  deletePoll() {
    const props = this.props
    props.deletePoll(this.props.params.id, () => {
      props.dispatch(pushState(null, '/profile'))
    })
  }

  render() {
    return (
      <PollForm poll={this.props.poll} onSubmit={this.submitForm} onDelete={this.deletePoll} />
    )
  }
}

function mapStateToProps(state) {
  const { session: { polls } } = state

  return {
    poll: polls[state.router.params.id] || {}
  }
}

export default connect(mapStateToProps, {
  loadPoll: admin.loadPoll,
  deletePoll: admin.deletePoll,
  updatePoll: admin.updatePoll
})(AdminEditPage)
