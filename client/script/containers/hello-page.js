import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { loadUsers } from '../actions'
import User from '../components/user'
import List from '../components/list'

function loadData(props) {
  props.loadUsers()
}

class HelloPage extends Component {
  constructor(props) {
    super(props)
    this.renderUser = this.renderUser.bind(this)
  }

  componentWillMount() {
    loadData(this.props)
  }

  renderUser(user) {
    return (
      <User user={user}
            key={user.id} />
    )
  }

  render() {
    const { users, usersPagination } = this.props
    return (
      <div>
        <List renderItem={this.renderUser}
              items={users}
              loadingLabel={`Loading users...`}
              {...usersPagination} />
      </div>
    )
  }
}

HelloPage.propTypes = {
  users: PropTypes.object.isRequired,
  usersPagination: PropTypes.object.isRequired,
  loadUsers: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { entities: {users}, pagination: {users: usersPagination} } = state

  let flattenedUsers = Object.values(users)

  return {
    usersPagination,
    users: flattenedUsers
  }
}

export default connect(mapStateToProps, {
  loadUsers
})(HelloPage)
