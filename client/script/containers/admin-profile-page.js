import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { loadMyPolls } from '../actions'
import PollLink from '../components/poll-link'
import List from '../components/list'

function loadData(props) {
  props.loadMyPolls()
}

class AdminProfilePage extends Component {
  constructor(props) {
    super(props)
    this.renderPoll = this.renderPoll.bind(this)
  }

  componentWillMount() {
    loadData(this.props)
  }

  renderPoll(poll) {
    console.log(poll)
    return (
      <PollLink link="edit" poll={poll}
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

AdminProfilePage.propTypes = {
  polls: PropTypes.array.isRequired,
  pollsPagination: PropTypes.object.isRequired,
  loadMyPolls: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { auth: { user: { polls }}, pagination: {polls: pollsPagination} } = state

  let flattenedPolls = Object.values(polls)

  console.log(flattenedPolls)
  return {
    pollsPagination,
    polls: flattenedPolls
  }
}

export default connect(mapStateToProps, {
  loadMyPolls
})(AdminProfilePage)
