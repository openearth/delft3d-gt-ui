import chai, { expect, assert } from 'chai'
import { shallowMount } from '@vue/test-utils'
import ModelControlMenu from '@/components/ModelControlMenu.vue'
import chaiAsPromised from 'chai-as-promised'

import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import $ from 'jquery'
import store from '@/store'

// setup chai
chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('ModelControlMenu.vue', () => {
  it('Is possible to instantiate component ModelControlMenu', (done) => {
    const modelControlMenu = shallowMount(ModelControlMenu, { propsData: { model: { active: true } } })

    assert.isOk(modelControlMenu)
    done()
  })
})
