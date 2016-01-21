import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { polls } from '../actions'
import PollLink from '../components/poll-link'
import List from '../components/list'

class PollsPage extends Component {
  constructor(props) {
    super(props)
    this.renderPoll = this.renderPoll.bind(this)
  }

  componentWillMount() {
    this.props.loadPolls()
  }

  renderPoll(poll) {
    return (
      <PollLink link="polls" poll={poll} key={poll.id} />
    )
  }

  render() {
    const { polls } = this.props
    return (
      <div>
        <List renderItem={this.renderPoll} items={polls} loadingLabel={`Loading polls...`} />
      </div>
    )
  }
}

PollsPage.propTypes = {
  polls: PropTypes.array.isRequired,
  loadPolls: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { cache: { polls } } = state

  return {
    polls: Object.values(polls)
  }
}

export default connect(mapStateToProps, {
  loadPolls: polls.loadAll
})(PollsPage)
