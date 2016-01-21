import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { users } from '../actions'
import UserLink from '../components/user-link'
import List from '../components/list'

class UsersPage extends Component {
  constructor(props) {
    super(props)
    this.renderUser = this.renderUser.bind(this)
  }

  componentWillMount() {
    this.props.loadUsers()
  }

  renderUser(user) {
    return (
      <UserLink user={user} key={user.id} />
    )
  }

  render() {
    const { users } = this.props
    return (
      <div>
        <List renderItem={this.renderUser} items={users} loadingLabel={`Loading users...`} />
      </div>
    )
  }
}

UsersPage.propTypes = {
  users: PropTypes.array.isRequired,
  loadUsers: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { cache: { users } } = state

  return {
    users: Object.values(users)
  }
}

export default connect(mapStateToProps, {
  loadUsers: users.loadAll
})(UsersPage)
