module.exports = {
  devServer: {
    port: 9000,
    proxy: {
      '^/login': {
        target: 'http://dl-026.xtr.deltares.nl/login/?next=/'
      },
      '^/logout': {
        target: 'http://dl-026.xtr.deltares.nl/login/?next=/'
      },
      '^/api/v1/*': {
        target: 'http://dl-026.xtr.deltares.nl'
      }
    }
  }
}
