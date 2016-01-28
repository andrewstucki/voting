import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

export default class PollLink extends Component {
  render() {
    const { poll: { id, name }, link } = this.props

    return (
        <Link to={`/${link}/${id}`} className="list-group-item">
          <div className="item-link">
            <h4 className="list-group-item-heading">{name}</h4>
            <p className="list-group-item-text">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
            <span className="badge">14 responses</span>
          </div>
        </Link>
    )
  }
}

PollLink.propTypes = {
  poll: PropTypes.shape({
    id: PropTypes.string.isRequired,
    user: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    published: PropTypes.bool.isRequired,
    allowOther: PropTypes.bool.isRequired,
    options: PropTypes.array.isRequired
  }).isRequired,
  link: PropTypes.string.isRequired
}
