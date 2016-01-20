import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { loadPoll } from '../actions'
import PollForm from '../components/poll-form'

class AdminEditPage extends Component {
  constructor(props) {
    super(props)
    this.props.loadPoll(this.props.params.id)
    this.submitForm = this.submitForm.bind(this)
  }

  submitForm(poll) {
    console.log(poll)
  }

  render() {
    return (
      <PollForm poll={this.props.poll} onSubmit={this.submitForm} />
    )
  }
}

function mapStateToProps(state) {
  const { entities: {polls} } = state

  return {
    poll: polls[state.router.params.id] || {}
  }
}

export default connect(mapStateToProps, {
  loadPoll
})(AdminEditPage)
