import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

export default class EditPoll extends Component {
  render() {
    const { poll: { id, name }, link } = this.props

    return (
      <div className="Poll">
        <Link to={`/${link}/${id}`}>
          {name}
        </Link>
      </div>
    )
  }
}

EditPoll.propTypes = {
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
