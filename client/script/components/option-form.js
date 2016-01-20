import React, { Component, PropTypes } from 'react'

export default class OptionForm extends Component {
  constructor(props) {
    super(props)

    this.onChangeValue = this.onChangeValue.bind(this)
    this.onChangePublished = this.onChangePublished.bind(this)
  }

  onChangeValue(e) {
    if (this.props.disabled) return
    const value = e.target.value
    this.props.onChangeValue(this.props.index, value)
  }

  onChangePublished(e) {
    if (this.props.disabled) return
    const value = e.target.checked
    this.props.onChangePublished(this.props.index, value)
  }

  render() {
    const index = this.props.index
    const { value, published } = this.props.option
    return (
      <div>
        <input className="form-control" name={`option-value-${index}`} type="text" placeholder={`Option ${index}`} onChange={this.onChangeValue} value={value ? value : ''} disabled={this.props.readOnly} />
        <input className="form-control" name={`option-published-${index}`} onChange={this.onChangePublished} type="checkbox" defaultChecked />
      </div>
    )
  }
}

OptionForm.propTypes = {
  option: PropTypes.shape({
    id: PropTypes.string,
    published: PropTypes.bool,
    value: PropTypes.string,
    count: PropTypes.number
  }).isRequired,
  index: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  onChangePublished: PropTypes.func.isRequired,
  onChangeValue: PropTypes.func.isRequired
}
