import jsdom from 'mocha-jsdom'
import assert from 'assert'
import React from 'react'
import TestUtils from 'react-addons-test-utils'

import UserLink from '../../../client/script/components/user-link'

describe('client UserLink Component', () => {
  jsdom()

  it('renders user info', () => {
    const user = {
      id: "1",
      username: "testing123",
      name: "this is a test",
      gravatarUrl: "https://blah.com"
    }
    let link = TestUtils.renderIntoDocument(
      <UserLink user={user}/>
    )
    let node = TestUtils.scryRenderedDOMComponentsWithClass(link, 'list-group-item-heading')[0]
    assert.equal(node.textContent, 'testing123')
    node = TestUtils.scryRenderedDOMComponentsWithClass(link, 'list-group-item-text')[0]
    assert.equal(node.textContent, 'this is a test')
    node = TestUtils.scryRenderedDOMComponentsWithClass(link, 'icon-thumbnail')[0]
    assert.equal(node.getAttribute('src'), "https://blah.com?s=50&d=mm")
  })
})
