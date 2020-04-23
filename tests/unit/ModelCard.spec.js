import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import ModelCard from '@/components/ModelCard.vue'

describe('ModelCard.vue', () => {
  it('render model, when  passed', () => {
    const model = { active: true }
    const wrapper = shallowMount(ModelCard, {
      propsData: { model }
    })
    let props = wrapper.props()
    expect(props).to.have.property('model')
  })
})
