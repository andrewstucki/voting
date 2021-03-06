import React, { Component, PropTypes } from 'react'

export default class List extends Component {
  renderLoadMore() {
    const { isFetching } = this.props
    return (
      <button style={{ fontSize: '150%' }}
              disabled={isFetching}>
        {isFetching ? 'Loading...' : 'Load More'}
      </button>
    )
  }

  render() {
    const {
      isFetching, nextPageUrl, pageCount,
      items, renderItem, loadingLabel
    } = this.props

    const isEmpty = items.length === 0
    if (isEmpty && isFetching) {
      return <p><i>{loadingLabel}</i></p>
    }

    const isLastPage = !nextPageUrl
    if (isEmpty && isLastPage) {
      return <p>Nothing here!</p>
    }

    return (
      <div className="list-group">
        {items.map(renderItem)}
        {pageCount > 0 && !isLastPage && this.renderLoadMore()}
      </div>
    )
  }
}

List.propTypes = {
  loadingLabel: PropTypes.string.isRequired,
  pageCount: PropTypes.number,
  renderItem: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  nextPageUrl: PropTypes.string
}

List.defaultProps = {
  isFetching: true,
  loadingLabel: 'Loading...'
}
