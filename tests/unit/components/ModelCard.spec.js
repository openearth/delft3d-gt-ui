import chai, { expect, assert } from 'chai'
import { shallowMount } from '@vue/test-utils'
import ModelCard from '@/components/ModelCard.vue'
import chaiAsPromised from 'chai-as-promised'

import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import $ from 'jquery'
import store from '@/store'

// setup chai
chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('ModelCard.vue', () => {
  it('Is possible to instantiate component ModelCard', (done) => {
    const modelcard = shallowMount(ModelCard, { propsData: { model: { active: true } } })

    assert.isOk(modelcard)
    done()
  })
})
