import React, { Component, PropTypes } from 'react'

import OptionForm from './option-form'

export default class PollForm extends Component {
  constructor(props) {
    super(props)
    this.doSubmit = this.doSubmit.bind(this)
    this.doDelete = this.doDelete.bind(this)
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

  doSubmit(e) {
    e.preventDefault()
    const name = document.getElementById("name").value
    const published = document.getElementById("published").checked
    const allowOther = document.getElementById("allow-other").checked

    //Do validation here

    this.props.onSubmit({
      name,
      published,
      allowOther,
      options: this.state.options.filter(option => /\S/.test(option.value))
    })
  }

  doDelete(e) {
    e.preventDefault()
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
    let deleteButton = ""
    if (this.props.poll.id) deleteButton = <button className="btn btn-block btn-danger" onClick={this.doDelete}>Delete</button>
    return (
      <div>
        <form name="poll-creation-form">
          <div className="form-group">
            <label className="col-lg-3 control-label" htmlFor="name">Name</label>
            <div className="col-lg-9">
              <input className="form-control" id="name" name="name" placeholder="My Awesome Poll" value={this.props.poll.name} required />
            </div>
          </div>
          <div class="form-group">
            <div class="col-lg-offset-3 col-lg-9">
              <div class="checkbox">
                <label>
                  <input type="checkbox" id="published" name="published" defaultChecked checked={this.props.poll.published} /> Published?
                </label>
              </div>
            </div>
          </div>
          <div class="form-group">
            <div class="col-lg-offset-3 col-lg-9">
              <div class="checkbox">
                <label>
                  <input type="checkbox" id="allow-other" name="allow-other" defaultChecked checked={this.props.poll.allowOther} /> Allow Additional Fill-in "Other" Response?
                </label>
              </div>
            </div>
          </div>
          <div className="form-group" id="options">
          {options.map((option, index) =>
            <OptionForm key={index} index={index} option={option} onChangeValue={this.changeOptionValue} />
          )}
          </div>
          <button className="btn btn-block btn-primary" onClick={this.addOption}>Add Option</button>
          <hr />
          <div className="form-buttons">
          <button className="btn btn-block btn-success" type="submit" onClick={this.doSubmit}>Submit</button>
          {deleteButton}
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
