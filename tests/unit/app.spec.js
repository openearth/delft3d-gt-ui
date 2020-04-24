import chai, { assert } from 'chai'
import { shallowMount } from '@vue/test-utils'
import App from '../../src/components/App.vue'
import chaiAsPromised from 'chai-as-promised'

import sinonChai from 'sinon-chai'

// setup chai
chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('App.vue', () => {
  it('Is possible to instantiate component App', (done) => {
    const app = shallowMount(App, { propsData: { model: { active: true } } })

    assert.isOk(app)
    done()
  })
})
