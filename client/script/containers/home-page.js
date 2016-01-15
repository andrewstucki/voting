import React, {Component} from 'react'

export default class HomePage extends Component {
  render() {
    return (
      <div className="col-lg-12 home">
        <div className="col-lg-4">
          <i className="fa fa-bolt"></i>
          <h2>Live Results</h2>
          <p>Live graphs show your poll results immediately in an easy to understand format. One graph will not provide the whole picture, that's why we provide multiple graph types to better describe your results.</p>
        </div>
        <div className="col-lg-4">
          <i className="fa fa-globe"></i>
          <h2>Works Everywhere</h2>
          <p>Traditional desktop computers now represent only 30% of Internet traffic. Your poll must work on the tablets, smart phones, netbooks and notebooks that your visitors are using. Our responsive designs do just that.</p>
        </div>
        <div className="col-lg-4">
          <i className="fa fa-facebook"></i>
          <h2>Social Integration</h2>
          <p>Free integrated facebook or traditional comments allow your poll voters to provide immediate feedback and discuss results. Social share buttons encourage your poll voters to help spread the word.</p>
        </div>
      </div>
    )
  }
}
