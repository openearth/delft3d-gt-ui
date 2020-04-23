import $ from 'jquery'
import sinon from 'sinon'
global.$ = $

window.URL.createObjectURL = sinon.stub()
global.URL.createObjectURL = sinon.stub()

global.$.ajaxSetup({
  beforeSend: (xhr, options) => {
    options.url = 'http://localhost' + options.url
  }
})
