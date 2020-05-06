import chai, { assert } from 'chai'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import SearchList from '../../../src/components/SearchList.vue'
import chaiAsPromised from 'chai-as-promised'
import sinonChai from 'sinon-chai'

const localVue = createLocalVue()
localVue.component('router-view', { template: '<a href="#">foo</a>' })

// setup chai
chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('SearchList.vue', () => {
  it('Is possible to instantiate component SearchList', (done) => {
    const searchList = shallowMount(SearchList, { propsData: { items: [], models: [] } }, localVue)
    assert.isOk(searchList)
    done()
  })
})
