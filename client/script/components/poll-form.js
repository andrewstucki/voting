import React, { Component, PropTypes } from 'react'

import OptionForm from './option-form'

export default class PollForm extends Component {
  constructor(props) {
    super(props)
    this.doSubmit = this.doSubmit.bind(this)
    this.addOption = this.addOption.bind(this)
    this.changeOptionValue = this.changeOptionValue.bind(this)
    this.state = {
      options: this.props.poll.options || [""]
    }
  }

  componentWillMount(props) {
    if (props && (props.poll.options !== this.props.poll.options)) {
      this.setState({
        options: props.poll.options
      })
    }
  }

  componentWillReceiveProps(props) {
    if (props && (props.poll.options !== this.props.poll.options)) {
      this.setState({
        options: props.poll.options
      })
    }
  }

  doSubmit(evt) {
    evt.preventDefault()
    const name = document.getElementById("name").value
    const published = document.getElementById("published").checked
    const allowOther = document.getElementById("allow-other").checked

    this.props.onSubmit({
      name,
      published,
      allowOther,
      options: this.state.options.filter(option => /\S/.test(option.value))
    })
  }

  changeOptionValue(index, value) {
    let newOptions = this.state.options.slice()
    newOptions[index] = value
    this.setState({options: newOptions})
  }

  addOption(e) {
    e.preventDefault()
    let newOptions = this.state.options.slice()
    newOptions.push("")
    this.setState({options: newOptions})
  }

  render() {
    const options = this.state.options
    return (
      <div className="col-lg-12 poll-form">
        <form name="poll-form">
          <div className="form-group">
            <label htmlFor="name">Enter the name of the poll you would like to create.</label>
            <input className="form-control" id="name" name="name" placeholder="My Awesome Poll" value={this.props.poll.name} required />
          </div>
          <div className="form-group">
            <label htmlFor="published">Published?</label>
            <input className="form-control" id="published" name="published" type="checkbox" defaultChecked checked={this.props.poll.published} />
          </div>
          <div className="form-group">
            <label htmlFor="allow-other">Allow Additional Fill-in "Other" Response?</label>
            <input className="form-control" id="allow-other" name="allow-other" type="checkbox" defaultChecked checked={this.props.poll.allowOther} />
          </div>
          <div className="form-group" id="options">
          {options.map((option, index) =>
            <OptionForm key={index} index={index} option={option} onChangeValue={this.changeOptionValue} />
          )}
          </div>
          <button className="btn btn-primary" onClick={this.addOption}>Add Option</button>
          <div className="form-buttons">
            <button className="btn btn-success" type="submit" onClick={this.doSubmit}>Submit</button>
          </div>
        </form>
      </div>
    )
  }
}

PollForm.propTypes = {
  poll: PropTypes.shape({
    id: PropTypes.string,
    user: PropTypes.string,
    name: PropTypes.string,
    published: PropTypes.bool,
    allowOther: PropTypes.bool,
    options: PropTypes.array
  }).isRequired,
  onSubmit: PropTypes.func.isRequired
}
