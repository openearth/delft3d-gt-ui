const webpack = require('webpack')

const argv = require('yargs').argv

const apiServer = argv.apiServer || 'http://dl-ng004.xtr.deltares.nl'

module.exports = {
  chainWebpack: (config) => {
    if (process.env.NODE_ENV === 'test') {
      const scssRule = config.module.rule('scss')
      scssRule.uses.clear()
      scssRule
        .use('null-loader')
        .loader('null-loader')
    }
  },
  filenameHashing: false,
  devServer: {
    port: 9000,
    proxy: {
      '^/login/*': {
        target: `${apiServer}`
      },
      '^/logout/*': {
        target: `${apiServer}`
      },
      '^/api/v1/*': {
        target: `${apiServer}`
      },
      '^/files/*': {
        target: `${apiServer}`
      },
      '^/thredds/*': {
        target: `${apiServer}`
      },
      '^/oidc/*': {
        target: `${apiServer}`
      }
    }
  },
  // Needed for the making jquery global for tagsinput
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
      })
    ],
    module: {
      rules: [
        {
          test: require.resolve('jquery'),
          use: [
            {
              loader: 'expose-loader',
              options: 'jQuery'
            },
            {
              loader: 'expose-loader',
              options: '$'
            }
          ]
        }
      ]
    }
  }
}
