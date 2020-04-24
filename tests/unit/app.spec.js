import chai, { assert } from 'chai'
import { shallowMount } from '@vue/test-utils'
import App from '@/App.vue'

import chaiAsPromised from 'chai-as-promised'

import $ from 'jquery'

import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import store from '@/store'

// setup chai
chai.use(chaiAsPromised)
chai.use(sinonChai)

// export to global;
global.$ = $

var window = document.defaultView
global.window = window

// Testing App
describe('App', () => {
  beforeEach(() => {
  // import component
    sinon.spy($, 'ajax')
    sinon.spy(Promise, 'all')
    sinon.spy(Promise, 'reject')
    sinon.spy(Promise, 'resolve')
    sinon.spy(store, 'dispatch')
  })

  afterEach(() => {
  // Unwrap spies
    $.ajax.restore()
    Promise.all.restore()
    Promise.reject.restore()
    Promise.resolve.restore()
    store.dispatch.restore()
  })
  it('can I initialized the application', (done) => {
    const app = shallowMount(App)
    assert.isOk(app)
    done()
  })
})
