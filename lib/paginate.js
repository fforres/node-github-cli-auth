const { debuglog } = require('util')
const debug = debuglog('GITHUB_AUTH')

module.exports = async (octokit, responsePromise, callback = res => res.data) => {
  let collection = []

  let response = await responsePromise

  // collect all the data
  collection = collection.concat(await callback(response))

  // eslint-disable-next-line no-unmodified-loop-condition
  while (octokit.hasNextPage(response)) {
    debug('[github] paginating through API calls')
    response = await octokit.getNextPage(response)
    collection = collection.concat(await callback(response))
  }

  return collection
}
