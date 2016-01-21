import jsdom from 'mocha-jsdom'
import assert from 'assert'
import React from 'react'
import TestUtils from 'react-addons-test-utils'

import UserLink from '../../../client/script/components/user-link'

describe('UserLink', () => {
  jsdom()

  it('includes email address', () => {
    const user = {
      id: "1",
      email: "test@example.com"
    }
    let link = TestUtils.renderIntoDocument(
      <UserLink user={user}/>
    )
    let href = TestUtils.findRenderedDOMComponentWithTag(link, 'a')
    assert.equal(href.textContent, 'test@example.com')
  })
})
