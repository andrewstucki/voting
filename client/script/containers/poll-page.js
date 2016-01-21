import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { polls } from '../actions'
import Poll from '../components/poll'

class PollPage extends Component {
  constructor(props) {
    super(props)
    this.props.loadPoll(this.props.params.id)
  }

  render() {
    return (
      <Poll poll={this.props.poll} />
    )
  }
}

function mapStateToProps(state) {
  const { cache: { polls } } = state

  return {
    poll: polls[state.router.params.id] || {}
  }
}

export default connect(mapStateToProps, {
  loadPoll: polls.load
})(PollPage)
