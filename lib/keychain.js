const { debuglog } = require('util')
const pkg = require('../package.json')

const debug = debuglog('GITHUB_AUTH')

const store = process.argv.includes('--no-store')

const keychain = {}

module.exports = (name = pkg.name) => {
  function getter (key, cb) {
    debug('[keychain] getting key: "%s"', key)

    return cb(key)
  }

  function setter (key, value, cb) {
    debug('[keychain] setting key: "%s" with value: "%s"', key, value)

    return cb(key, value)
  }

  function deleter (key, cb) {
    debug('[keychain] delete key: "%s', key)

    return cb(key)
  }

  let get = (key) => getter(key, (key) => keychain[`${name}:${key}`])
  let set = (key, value) => setter(key, value, (key, value) => (keychain[`${name}:${key}`] = value))
  let del = (key) => deleter(key, (key) => (delete keychain[`${name}:${key}`]))

  // flag to prevent keychain storage
  if (store) {
    return { get, set, del }
  }

  try {
    const keytar = require('keytar')

    get = (key) => getter(key, (key) => keytar.getPassword(name, key))
    set = (key, value) => setter(key, value, (key, value) => keytar.setPassword(name, key, value))
    del = (key) => deleter(key, (key) => keytar.deletePassword(name, key))
  } catch (err) {
    debug('[keychain] keytar is not installed correctly, not saving password')
  }

  return { get, set, del }
}
