import chai, { expect, assert } from 'chai'
import { shallowMount } from '@vue/test-utils'
import NavigationBar from '@/components/NavigationBar.vue'
import chaiAsPromised from 'chai-as-promised'

import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import $ from 'jquery'
import store from '@/store'

// setup chai
chai.use(chaiAsPromised)
chai.use(sinonChai)

const $route = {
  name: 'test'
}

describe('NavigationBar.vue', () => {
  it('Is possible to instantiate component NavigationBar', (done) => {
    const navigationBar = shallowMount(NavigationBar, { mocks: { $route } })

    assert.isOk(navigationBar)
    done()
  })
})
