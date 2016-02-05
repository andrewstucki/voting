import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { Doughnut } from 'react-chartjs'

import { polls, flash } from '../actions'

function shadeRGBColor(color, percent) {
  const f = color.split(",")
  const t = percent < 0 ? 0 : 255
  const p = percent < 0 ? percent*-1 : percent
  const R = parseInt(f[0].slice(4))
  const G = parseInt(f[1])
  const B = parseInt(f[2].slice(0, -1))
  return `rgb(${Math.round((t-R)*p)+R},${Math.round((t-G)*p)+G},${Math.round((t-B)*p)+B})`
}

function dynamicColors(){
  return `rgb(${Math.floor(Math.random()*220) + 12},${Math.floor(Math.random()*220) + 12},${Math.floor(Math.random()*220) + 12})`
}

export default class Poll extends Component {
  constructor(props) {
    super(props)
    this.data = []
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

  chart() {
    const self = this
    const { answers } = this.props.results
    if(answers) {
      const data = Object.keys(answers).map(answer => {
        const color = dynamicColors()
        const highlight = shadeRGBColor(color, 0.05)
        const entries = self.data.filter(entry => entry.label === answer)
        if (entries.length == 0) {
          const entry = {value: answers[answer], label: answer, color, highlight}
          self.data.push(entry)
          return entry
        }
        return Object.assign({}, entries[0], {value: answers[answer]})
      })
      const legendKeys = data.map((entry, i) => {
        return <li key={i}><div style={{backgroundColor: entry.color}} className="legend-key"></div><label>{entry.label}</label></li>
      })
      return (
        <div>
          <h3>Responses: {data.map(entry => entry.value).reduce((sum, count) => sum + count)}</h3>
          <Doughnut data={data} height="250" className="poll-data" />
          <ul className="legend">
            {legendKeys}
          </ul>
        </div>
      )
    }
    return (<h1>N/A</h1>)
  }

  render() {
    const { id, name, allowOther, options, user } = this.props.poll
    const { id: user_id, username } = user || {}

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
            Created by: <Link to={`/users/${user_id}`}>{username}</Link>
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
              {this.chart()}
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
      username: PropTypes.string,
      id: PropTypes.string
    }),
    name: PropTypes.string,
    published: PropTypes.bool,
    allowOther: PropTypes.bool,
    options: PropTypes.array
  }).isRequired,
  results: PropTypes.shape({
    id: PropTypes.string,
    answers: PropTypes.object
  }).isRequired
}

export default connect(null, {
  vote: polls.vote,
  setMessage: flash.setMessage
})(Poll)
