import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

export default class UserLink extends Component {
  render() {
    const { id, username, name, gravatarUrl } = this.props.user

    return (
      <Link to={`/users/${id}`} className="list-group-item">
        <div className="item-link">
          <img className="icon-thumbnail user-avatar" src={gravatarUrl + "?s=50&d=mm"} />
          <div className="user-item">
            <h4 className="list-group-item-heading">{username}</h4>
            <p className="list-group-item-text">{name}</p>
          </div>
        </div>
      </Link>
    )
  }
}

UserLink.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    gravatarUrl: PropTypes.string.isRequired
  }).isRequired
}
