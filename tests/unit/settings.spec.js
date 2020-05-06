import $ from 'jquery'
import sinon from 'sinon'
import nock from 'nock'
global.$ = $
global.window = window
window.URL.createObjectURL = sinon.stub()
global.URL.createObjectURL = sinon.stub()

global.$.ajaxPrefilter((options) => {
  options.url = 'http://localhost' + options.url
  console.log(options.url)
})
