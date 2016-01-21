import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { admin } from '../actions'
import PollLink from '../components/poll-link'
import List from '../components/list'

class AdminProfilePage extends Component {
  constructor(props) {
    super(props)
    this.renderPoll = this.renderPoll.bind(this)
  }

  componentWillMount() {
    this.props.loadPolls()
  }

  renderPoll(poll) {
    return (
      <PollLink link="edit" poll={poll} key={poll.id} />
    )
  }

  render() {
    const { polls, pollsPagination } = this.props
    return (
      <div>
        <List renderItem={this.renderPoll} items={polls} loadingLabel={`Loading polls...`} />
      </div>
    )
  }
}

AdminProfilePage.propTypes = {
  polls: PropTypes.array.isRequired,
  loadPolls: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { session: { polls } } = state

  return {
    polls: Object.values(polls)
  }
}

export default connect(mapStateToProps, {
  loadPolls: admin.loadPolls
})(AdminProfilePage)
