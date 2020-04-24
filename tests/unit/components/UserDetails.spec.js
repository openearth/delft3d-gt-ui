import chai, { assert } from 'chai'
import { shallowMount } from '@vue/test-utils'
import UserDetails from '../../../components/UserDetails.vue'
import chaiAsPromised from 'chai-as-promised'

import sinonChai from 'sinon-chai'
// setup chai
chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('UserDetails.vue', () => {
  it('Is possible to instantiate component UserDetails', (done) => {
    const userDetails = shallowMount(UserDetails)

    assert.isOk(userDetails)
    done()
  })
})
