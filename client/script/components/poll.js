import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

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
    const other = document.querySelector('input[name="option"]:checked').id === "otherRadio"
    let value
    if (other) {
      value = document.getElementById('otherValue').value
    } else {
      value = document.querySelector('input[name="option"]:checked').value
    }

    this.props.vote(this.props.poll.id, {
      value: value,
      isOther: other
    }).then(response => props.setMessage(flash.SUCCESS, response.message))
  }

  render() {
    const { id, name, allowOther, options } = this.props.poll

    let otherNode = ''
    if (allowOther) {
      otherNode = (
        <div>
          <input type="radio" id="otherRadio" name="option" value="Other" />
          <label htmlFor="otherRadio">Other</label>
          <input type="text" id="otherValue" />
        </div>
      )
    }

    let nodes = (options || []).map((option, index) => {
      return (
        <div key={index}>
          <input type="radio" id={`option-${index}`} name="option" value={option.value} />
          <label htmlFor={`option-${index}`}>{option.value}</label>
        </div>
      )
    })

    return (
      <div className="col-lg-12 poll-form">
        <form name="vote-form">
          <div id="options">
            {nodes}
            {otherNode}
          </div>
          <div className="form-buttons">
            <button className="btn btn-success" type="submit" onClick={this.doVote}>Submit</button>
          </div>
        </form>
      </div>
    )
  }
}

Poll.propTypes = {
  poll: PropTypes.shape({
    id: PropTypes.string,
    user: PropTypes.string,
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
