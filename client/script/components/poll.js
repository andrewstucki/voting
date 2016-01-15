import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

export default class Poll extends Component {
  render() {
    const { id, name } = this.props.poll

    return (
      <div className="Poll">
        <Link to={`/polls/${id}`}>
          {name}
        </Link>
      </div>
    )
  }
}

Poll.propTypes = {
  poll: PropTypes.shape({
    id: PropTypes.string.isRequired,
    user: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    published: PropTypes.bool.isRequired,
    allowOther: PropTypes.bool.isRequired,
    options: PropTypes.array.isRequired
  }).isRequired
}
