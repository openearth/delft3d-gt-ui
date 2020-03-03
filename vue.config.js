const argv = require('yargs').argv

const apiServer = argv.apiServer || 'http://dl-ng004.xtr.deltares.nl'

module.exports = {
  devServer: {
    port: 9000,
    proxy: {
      '^/login': {
        target: `${apiServer}/login/?next=/`
      },
      '^/logout': {
        target: `${apiServer}/login/?next=/`
      },
      '^/api/v1/*': {
        target: `${apiServer}`
      }
    }
  }
}
