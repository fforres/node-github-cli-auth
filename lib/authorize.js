const { debuglog } = require('util')
const inquirer = require('inquirer')

const paginate = require('./paginate')

const debug = debuglog('GITHUB_AUTH')

module.exports = async function authorize (...args) {
  const [ client, scopes, headers ] = args
  const note = headers['user-agent']

  try {
    // attempt authorization
    debug('[authorize] attempt authorization for "%s" scopes: %j', note, scopes)

    return await client.authorization.create({ scopes, note })
  } catch (error) {
    if (error.code === 401 && error.message.match('two-factor authentication')) {
      debug('[authorize] two factor requested')

      // as the user for the two-factor authentication token
      const { otp } = await inquirer.prompt({
        type: 'input',
        name: 'otp',
        message: 'two-factor authentication OTP code',
        validate: answer => answer.length > 0 || 'code cannot be empty'
      })

      // set the two-factor code in the header for all subsequent calls
      headers['X-GitHub-OTP'] = otp

      // try again
      return authorize(...args)
    }

    // authorization already exists for our application
    if (error.code === 422 && error.message.match('already_exists')) {
      debug('[authorize] client authorization already exists for "%s"', note)

      // find old one
      const data = await paginate(client, client.authorization.getAll({ per_page: 100 }))
      const auth = data.find(auth => auth.note === note)

      debug('[authorize] found old client authorization from %d results', data.length)

      // delete it
      await client.authorization.delete({ authorization_id: auth.id })

      // try again
      return authorize(...args)
    }

    // throw the error if all else fails
    throw error
  }
}
