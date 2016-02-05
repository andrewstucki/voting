import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { admin } from '../actions'
import List from '../components/list'
import User from '../components/user'

class AdminProfilePage extends Component {
  constructor(props) {
    super(props)
    this.props.loadPolls()
    this.updateProfile = this.updateProfile.bind(this)
  }

  updateProfile(e) {
    e.preventDefault()
  }

  render() {
    const { name, username, email } = this.props.user
    return (
      <User user={this.props.user} polls={this.props.polls} pollLink="edit" >
        <div className="panel panel-default">
          <div className="panel-heading"><h4>User Settings</h4></div>
          <div className="list-group">
            <div className="list-group-item">
              <form className="form-horizontal">
                <div className="form-group">
                  <label className="col-sm-3 control-label" htmlFor="name">Name</label>
                  <div className="col-sm-9">
                    <input className="form-control" id="name" name="name" type="text" placeholder="John Smith" value={name} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-3 control-label" htmlFor="username">Username</label>
                  <div className="col-sm-9">
                    <input className="form-control" id="username" name="username" type="text" placeholder="johnsmith" value={username} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-3 control-label" htmlFor="email">Email</label>
                  <div className="col-sm-9">
                    <input className="form-control" id="email" name="email" type="text" value={email} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-3 control-label" htmlFor="password">Password</label>
                  <div className="col-sm-9">
                    <input className="form-control" id="password" name="password" type="password" placeholder="********" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="col-sm-3 control-label" htmlFor="confirmation">Password Confirmation</label>
                  <div className="col-sm-9">
                    <input className="form-control" id="confirmation" name="confirmation" type="password" placeholder="********" />
                  </div>
                </div>
                <button className="btn btn-success btn-block" onClick={this.updateProfile}>Save Changes</button>
              </form>
            </div>
          </div>
        </div>
      </User>
    )
  }
}

AdminProfilePage.propTypes = {
  polls: PropTypes.array.isRequired,
  loadPolls: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { session: { polls }, auth: { user } } = state

  return {
    user,
    polls: Object.values(polls)
  }
}

export default connect(mapStateToProps, {
  loadPolls: admin.loadPolls
})(AdminProfilePage)
