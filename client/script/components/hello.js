import React, { Component, PropTypes } from 'react';
import shouldPureComponentUpdate from 'react-pure-render/function';

export default class Hello extends Component {
  static propTypes = {
    email: PropTypes.string
  };

  static contextTypes = {
    history: PropTypes.object.isRequired
  };

  shouldComponentUpdate = shouldPureComponentUpdate;

  constructor(props) {
    super(props);

    this.handleGoClick = this.handleGoClick.bind(this);

    // State that depends on props is often an anti-pattern, but in our case
    // that's what we need to we can update the input both in response to route
    // change and in response to user typing.
    this.state = {
      email: props.email
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      email: nextProps.email
    });
  }

  render() {
    return (
      <div className='Hello'>
        <p>Hello World!</p>
        <button onClick={this.handleGoClick}>Go!</button>
      </div>
    );
  }

  handleGoClick() {
    alert("hi")
    // this.context.history.pushState(null, `/${this.getInputValue()}`);
  }
}
