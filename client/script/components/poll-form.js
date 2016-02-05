import React, { Component, PropTypes } from 'react'

import OptionForm from './option-form'

export default class PollForm extends Component {
  constructor(props) {
    super(props)
    this.doSubmit = this.doSubmit.bind(this)
    this.doDelete = this.doDelete.bind(this)
    this.updateState = this.updateState.bind(this)
    this.addOption = this.addOption.bind(this)
    this.changeOptionValue = this.changeOptionValue.bind(this)
    this.state = Object.assign({}, props.poll || {}, { options: props.poll.options || [""] })
  }

  componentWillMount(props) {
    if (props && props.poll) this.setState(props.poll)
  }

  componentWillReceiveProps(props) {
    if (props && props.poll) this.setState(props.poll)
  }

  doSubmit(e) {
    e.preventDefault()
    //Do validation here

    this.props.onSubmit({
      id: this.state.id,
      name: this.state.name,
      description: this.state.description,
      published: this.state.published,
      allowOther: this.state.allowOther,
      options: this.state.options.filter(option => /\S/.test(option.value))
    })
  }

  updateState(e) {
    let newState = {}
    newState[e.target.id] = e.target.getAttribute('type') === 'checkbox' ? e.target.checked : e.target.value
    this.setState(Object.assign({}, this.state, newState))
  }

  doDelete(e) {
    e.preventDefault()
    if (this.props.onDelete) this.props.onDelete()
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
    const { id, name, published, allowOther, options, description } = this.state
    let deleteButton = ""
    if (this.props.poll.id) deleteButton = <button className="btn btn-block btn-danger" onClick={this.doDelete}>Delete</button>
    return (
      <div>
        <form name="poll-creation-form">
          <div className="form-group">
            <label className="col-lg-3 control-label" htmlFor="name">Name</label>
            <div className="col-lg-9">
              <input className="form-control" id="name" name="name" placeholder="My Awesome Poll" value={name} onChange={this.updateState} required />
            </div>
          </div>
          <div className="form-group">
            <label className="col-lg-3 control-label" htmlFor="description">Description</label>
            <div className="col-lg-9">
              <input className="form-control" id="description" name="description" placeholder="My Awesome Poll's description" value={description} onChange={this.updateState} />
            </div>
          </div>
          <div className="form-group">
            <div className="col-lg-offset-3 col-lg-9">
              <div className="checkbox">
                <label>
                  <input type="checkbox" id="published" name="published" defaultChecked checked={published} onChange={this.updateState} /> Published?
                </label>
              </div>
            </div>
          </div>
          <div className="form-group">
            <div className="col-lg-offset-3 col-lg-9">
              <div className="checkbox">
                <label>
                  <input type="checkbox" id="allowOther" name="allowOther" checked={allowOther} onChange={this.updateState} /> Allow Additional Fill-in "Other" Response?
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
    user: PropTypes.object,
    name: PropTypes.string,
    description: PropTypes.string,
    published: PropTypes.bool,
    allowOther: PropTypes.bool,
    options: PropTypes.array
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onDelete: PropTypes.func
}
