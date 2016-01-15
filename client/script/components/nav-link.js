import React, { Component, PropTypes} from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

function createLocationDescriptor(to, state) {
  if (typeof to === 'string') {
    return {pathname: to, query: '', hash: '', state}
  }
  return {query: '', hash: '', state, ...to}
}

class NavLink extends Component {
  render() {
    let { className, to, ...props } = this.props
    let location = state.router.location.pathname.substring(1)
    if (state.router) {
      console.log(state.router.isActive(location, false))
      props.active = state.router.isActive(location, false)
    }

    if (props.active && className) {
      if (className) {
        props.className = `${props.className || ''}${props.className ? ' ' : ''}active`
      }
    }

    console.log("here");
    return (
      <li className={props.className}>
        <Link to={location}>
          {this.props.children}
        </Link>
      </li>
    )
  }
}

NavLink.contextTypes = {
  router: PropTypes.object
}

NavLink.propTypes = {
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  className: PropTypes.string,
}

export default NavLink
