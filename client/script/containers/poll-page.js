import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { polls } from '../actions'
import Poll from '../components/poll'

class PollPage extends Component {
  constructor(props) {
    super(props)
    this.props.subscribe(this.props.params.id)
    this.props.loadPoll(this.props.params.id)
    this.props.loadResults(this.props.params.id)
  }

  render() {
    return (
      <Poll poll={this.props.poll} results={this.props.results} />
    )
  }
}

function mapStateToProps(state) {
  const { cache: { polls, results } } = state

  return {
    poll: polls[state.router.params.id] || {},
    results: results[state.router.params.id] || {}
  }
}

export default connect(mapStateToProps, {
  loadPoll: polls.load,
  loadResults: polls.loadResults,
  subscribe: polls.subscribe
})(PollPage)
