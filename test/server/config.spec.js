import assert from 'assert'

describe('api config', () => {
  it('defaults the environment to development', done => {
    delete require.cache[require.resolve('../../server/config')]
    delete process.env['ENVIRONMENT']
    let config = require('../../server/config')
    delete require.cache[require.resolve('../../server/config')]
    process.env['ENVIRONMENT'] = 'test'
    require('../../server/config')

    assert.equal("development", config.environment)
    done()
  })

  it('contains configuration for database and ports and the environment name for development', done => {
    delete require.cache[require.resolve('../../server/config')]
    process.env['ENVIRONMENT'] = 'development'
    let config = require('../../server/config')
    delete require.cache[require.resolve('../../server/config')]
    process.env['ENVIRONMENT'] = 'test'
    require('../../server/config')

    assert(config.hasOwnProperty('db'), 'Configuration does not contain db field')
    assert(config.hasOwnProperty('port'), 'Configuration does not contain port field')
    assert(config.hasOwnProperty('environment'), 'Configuration does not contain environment field')
    assert.equal("development", config.environment)
    done()
  })

  it('contains configuration for database and ports and the environment name for test', done => {
    let config = require('../../server/config')

    assert(config.hasOwnProperty('db'), 'Configuration does not contain db field')
    assert(config.hasOwnProperty('port'), 'Configuration does not contain port field')
    assert(config.hasOwnProperty('environment'), 'Configuration does not contain environment field')
    assert.equal("test", config.environment)
    done()
  })
})
