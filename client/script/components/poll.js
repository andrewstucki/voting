import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { Doughnut } from 'react-chartjs'

import { polls, flash } from '../actions'

export default class Poll extends Component {
  constructor(props) {
    super(props)
    this.doVote = this.doVote.bind(this)
  }

  componentWillMount(props) {
    if (props && (props.poll !== this.props.poll)) {
      this.forceUpdate()
    }
  }

  componentWillReceiveProps(props) {
    if (props && (props.poll !== this.props.poll)) {
      this.forceUpdate()
    }
  }

  doVote(e) {
    e.preventDefault()

    let props = this.props
    const other = document.querySelector('input[name="option"]:checked').id === "other-radio"
    let value
    if (other) {
      value = document.getElementById('other-value').value
    } else {
      value = document.querySelector('input[name="option"]:checked').value
    }

    this.props.vote(this.props.poll.id, {
      value: value
    }).then(response => props.setMessage(flash.SUCCESS, response.message))
  }

  shareButtons() {
    return (
      <div className="social-media-share">
        <a target="_blank" href={`https://www.linkedin.com/shareArticle?mini=true&url=${window.location.href}`}><button className="btn btn-linkedin btn-share btn-xs">LinkedIn <i className="fa fa-linkedin-square"></i></button></a>
        <a target="_blank" href={`https://digg.com/submit?url=${window.location.href}`}><button className="btn btn-digg btn-share btn-xs">Digg <i className="fa fa-digg"></i></button></a>
        <a target="_blank" href={`https://reddit.com/submit?url=${window.location.href}`}><button className="btn btn-reddit btn-share btn-xs">Reddit <i className="fa fa-reddit"></i></button></a>
        <a target="_blank" href={`https://facebook.com/sharer.php?u=${window.location.href}`}><button className="btn btn-facebook btn-share btn-xs">Facebook <i className="fa fa-facebook-official"></i></button></a>
        <a target="_blank" href={`https://plus.google.com/share?url=${window.location.href}`}><button className="btn btn-google btn-share btn-xs">Google+ <i className="fa fa-google-plus"></i></button></a>
        <a target="_blank" href={`https://twitter.com/intent/tweet?url=${window.location.href}`}><button className="btn btn-twitter btn-share btn-xs">Twitter <i className="fa fa-twitter"></i></button></a>
      </div>
    )
  }

  chartData() {
    return [{
      value: 300,
      color:"#F7464A",
      highlight: "#FF5A5E",
      label: "Red"
    },
    {
      value: 50,
      color: "#46BFBD",
      highlight: "#5AD3D1",
      label: "Green"
    },
    {
      value: 100,
      color: "#FDB45C",
      highlight: "#FFC870",
      label: "Yellow"
    }]
  }

  render() {
    const { id, name, allowOther, options, user } = this.props.poll
    const { email: user_email, id: user_id } = user || {}

    let otherNode = ''
    if (allowOther) {
      otherNode = (
        <div className="radio">
          <label>
            <input type="radio" id="other-radio" name="option" value="Other" />
            Other <input type="text" id="other-value" />
          </label>
        </div>
      )
    }

    let nodes = (options || []).map((option, index) => {
      return (
        <div className="radio" key={index}>
          <label>
            <input type="radio" id={`option-${index}`} name="option" value={option} />
            {option}
          </label>
        </div>
      )
    })

    return (
        <div className="col-lg-12">
          <div className="poll-header">
            <h2>{name}</h2>
            Created by: <Link to={`/users/${user_id}`}>{user_email}</Link>
          </div>
          <div className="row poll-form">
            <div className="col-lg-6">
              <form className="vote-form" name="vote-form">
                <div id="options">
                  {nodes}
                  {otherNode}
                </div>
                <div className="form-buttons">
                  <button className="btn btn-block btn-success vote-submit" type="submit" onClick={this.doVote}>Submit</button>
                </div>
              </form>
            </div>
            <div className="col-lg-6 poll-results">
              <Doughnut data={this.chartData()} width="600" height="250" />
            </div>
          </div>
          {this.shareButtons()}
        </div>
    )
  }
}

Poll.propTypes = {
  poll: PropTypes.shape({
    id: PropTypes.string,
    user: PropTypes.shape({
      email: PropTypes.string,
      id: PropTypes.string
    }),
    name: PropTypes.string,
    published: PropTypes.bool,
    allowOther: PropTypes.bool,
    options: PropTypes.array
  }).isRequired
}

export default connect(null, {
  vote: polls.vote,
  setMessage: flash.setMessage
})(Poll)
