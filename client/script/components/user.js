import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

export default class User extends Component {
  render() {
    const { id, email } = this.props.user

    return (
      <div className="User">
        <Link to={`/users/${id}`}>
          <h3>
            {email}
          </h3>
        </Link>
      </div>
    )
  }
}

User.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired
  }).isRequired
}
