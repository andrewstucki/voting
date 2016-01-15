import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { loadPolls } from '../actions'
import Poll from '../components/poll'
import List from '../components/list'

function loadData(props) {
  props.loadPolls()
}

class PollsPage extends Component {
  constructor(props) {
    super(props)
    this.renderPoll = this.renderPoll.bind(this)
  }

  componentWillMount() {
    loadData(this.props)
  }

  renderPoll(poll) {
    return (
      <Poll poll={poll}
            key={poll.id} />
    )
  }

  render() {
    const { polls, pollsPagination } = this.props
    return (
      <div>
        <List renderItem={this.renderPoll}
              items={polls}
              loadingLabel={`Loading polls...`}
              {...pollsPagination} />
      </div>
    )
  }
}

PollsPage.propTypes = {
  polls: PropTypes.array.isRequired,
  pollsPagination: PropTypes.object.isRequired,
  loadPolls: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { entities: {polls}, pagination: {polls: pollsPagination} } = state

  let flattenedPolls = Object.values(polls)

  return {
    pollsPagination,
    polls: flattenedPolls
  }
}

export default connect(mapStateToProps, {
  loadPolls
})(PollsPage)
