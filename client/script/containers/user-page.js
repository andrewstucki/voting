import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { polls, users } from '../actions'
import User from '../components/user'

class UserPage extends Component {
  constructor(props) {
    super(props)
    this.props.loadUser(this.props.params.id)
    this.props.loadPolls()
  }

  render() {
    return (
      <User user={this.props.user} polls={this.props.polls} />
    )
  }
}

function mapStateToProps(state) {
  const { cache: { users, polls } } = state

  return {
    user: users[state.router.params.id] || {},
    polls: Object.values(polls).filter(poll => poll.user.id === state.router.params.id)
  }
}

export default connect(mapStateToProps, {
  loadUser: users.load,
  loadPolls: polls.loadAll
})(UserPage)
