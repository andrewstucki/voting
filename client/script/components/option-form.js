import React, { Component, PropTypes } from 'react'

export default class OptionForm extends Component {
  constructor(props) {
    super(props)

    this.onChangeValue = this.onChangeValue.bind(this)
  }

  onChangeValue(e) {
    const value = e.target.value
    this.props.onChangeValue(this.props.index, value)
  }

  render() {
    return (
      <div>
        <input className="form-control" name={`option-value-${this.props.index}`} type="text" placeholder={`Option ${this.props.index + 1}`} onChange={this.onChangeValue} value={this.props.option ? this.props.option : ''} />
      </div>
    )
  }
}

OptionForm.propTypes = {
  option: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onChangeValue: PropTypes.func.isRequired
}
