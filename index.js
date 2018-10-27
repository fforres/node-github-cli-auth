const inquirer = require('inquirer')
const octokit = require('@octokit/rest')

const authorize = require('./lib/authorize')
const keychain = require('./lib/keychain')
const pkg = require('./package.json')

module.exports = function (name = `${pkg.name}@${pkg.version}`) {
  function reset (username) {
    if (username) {
      const chain = keychain(name)

      return chain.del(username)
    }
  }

  async function token ({ remember = { lastuser: true, password: false }, scopes = ['repo'] } = {}) {
    const headers = {
      'user-agent': name
    }

    const client = octokit({ headers })

    const chain = keychain(name)

    // grab username from keychain
    let lastuser = await chain.get('lastuser')

    // ask for username
    let { username } = await inquirer.prompt({
      type: 'input',
      name: 'username',
      message: 'your Github username:',
      default: lastuser,
      validate: answer => answer.length > 0 || 'username cannot be empty'
    })

    // securely store for later usage
    if (remember.lastuser) await chain.set('lastuser', username)

    // grab token from keychain
    let secret = await chain.get(username)

    // parse secret
    let { password, token } = JSON.parse(secret) || {}
    if (!token) {
      if (!password) {
        // ask for password
        ({ password } = await inquirer.prompt({
          type: 'password',
          name: 'password',
          message: 'your Github password:',
          validate: answer => answer.length > 0 || 'password cannot be empty'
        }))
      }

      console.log(password, token)
      // set authentication mode to basic auth
      client.authenticate({ type: 'basic', username, password });

      // get personal token from github
      ({ data: { token } } = await authorize(client, scopes, headers))

      // securely store for later usage
      const secret = { token }
      if (remember.password) secret.password = password

      // securely store for later usage
      await chain.set(username, JSON.stringify(secret))
    }

    client.authenticate({ type: 'token', token })

    return { username, token }
  }

  return { reset, token }
}
