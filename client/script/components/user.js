import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'

import { users, flash } from '../actions'

class User extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount(props) {
    if (props && (props.user !== this.props.user)) {
      this.forceUpdate()
    }
  }

  componentWillReceiveProps(props) {
    if (props && (props.user !== this.props.user)) {
      this.forceUpdate()
    }
  }

  render() {
    const { id, email, gravatarUrl } = this.props.user

    console.log(this.props.polls)

    const polls = this.props.polls.map(poll => {
      return (
        <li key={poll.id}>
          <Link to={`/polls/${poll.id}`}>{poll.name}</Link>
        </li>
      )
    })

    let pollsNode = ""
    if (polls.length > 0) {
      pollsNode = (
        <div>
          Polls:
          <ul>
            {polls}
          </ul>
        </div>
      )
    }

    return (
      <div className="col-lg-12 user">
        <img src={gravatarUrl + "?s=200&d=mm"} className='user-avatar' />
        <h2>{ email }</h2>
        {pollsNode}
      </div>
    )
  }
}

User.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    email: PropTypes.string,
    gravatarUrl: PropTypes.string
  }).isRequired,
  polls: PropTypes.array.isRequired
}

export default connect(null, {
  setMessage: flash.setMessage
})(User)
