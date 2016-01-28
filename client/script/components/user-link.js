import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

export default class UserLink extends Component {
  render() {
    const { id, email, gravatarUrl } = this.props.user

    return (
      <Link to={`/users/${id}`} className="list-group-item">
        <div className="item-link">
          <img className="icon-thumbnail" src={gravatarUrl + "?s=50&d=mm"} />
          <h4 className="user-item">{email}</h4>
        </div>
      </Link>
    )
  }
}

UserLink.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    gravatarUrl: PropTypes.string.isRequired
  }).isRequired
}
