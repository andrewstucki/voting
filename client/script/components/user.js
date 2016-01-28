import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'

import { users, flash } from '../actions'
import PollLink from './poll-link'

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

    let polls = this.props.polls.map(poll => {
      return (
        <PollLink link="polls" poll={poll} key={poll.id} />
      )
    })

    if (polls.length === 0) {
      polls = (
        <div className="list-group-item">
          <h4 class="list-group-item-heading">N/A</h4>
        </div>
      )
    }

    return (
      <div className="col-lg-12 user">
        <div className="col-lg-3 user-profile">
          <img src={gravatarUrl + "?s=200&d=mm"} className='user-avatar' />
          <div className="user-contact">
            <h2 className="user-full-name">{ email }</h2>
            <h2 className="user-username">{ email }</h2>
          </div>
        </div>
        <div className="col-lg-9">
          {this.props.children}
          <div className="panel panel-default">
            <div className="panel-heading"><h4>Polls</h4></div>
            <div className="list-group">
              {polls}
            </div>
          </div>
        </div>
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
  polls: PropTypes.array.isRequired,
}

export default connect(null, {
  setMessage: flash.setMessage
})(User)
