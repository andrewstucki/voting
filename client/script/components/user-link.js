import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

export default class UserLink extends Component {
  render() {
    const { id, email } = this.props.user

    return (
      <div className="User">
        <Link to={`/users/${id}`}>
          {email}
        </Link>
      </div>
    )
  }
}

UserLink.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired
  }).isRequired
}
