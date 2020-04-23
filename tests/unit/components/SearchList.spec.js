// import chai, { expect, assert } from 'chai'
// import { shallowMount } from '@vue/test-utils'
// import SearchList from '@/components/SearchList.vue'
// import chaiAsPromised from 'chai-as-promised'
//
// import sinon from 'sinon'
// import sinonChai from 'sinon-chai'
// import $ from 'jquery'
// import store from '@/store'
//
// // setup chai
// chai.use(chaiAsPromised)
// chai.use(sinonChai)

// describe('SearchList.vue', () => {
//   it('Is possible to instantiate component SearchList', (done) => {
//     const searchList = shallowMount(SearchList, { propsData: { items: [], models: []} })
//
//     assert.isOk(searchList)
//     done()
//   })
// })

// describe('SearchList class', () => {
//   it('Should be possible deselect all runs', (done) => {
//     // Add an artificial sene with a model in scene_set with id 1.
//     const aSearchList = shallowMount(SearchList)
//
//     aSearchList.items = []
//
//     var scenario = {
//       id: 123,
//       active: true
//     }
//
//     aSearchList.items.push(scenario)
//
//     // Assume we test #1
//     scenario.active = false
//
//     assert.equal(aSearchList.selectedItems.length, 0, 'selected items are empty')
//     done()
//   })
//
//   it('Should be possible select a scenario', (done) => {
//     // Add an artificial sene with a model in scene_set with id 1.
//     const aSearchList = shallowMount(SearchList)
//
//     var scenario = {
//       id: 123,
//       active: false
//     }
//
//     aSearchList.items = [scenario]
//     aSearchList.toggleActive(scenario)
//     assert.equal(aSearchList.selectedItems.length, 1, 'selected items equal to 1')
//     done()
//   })
//
//   it('Should be possible get selected runs', (done) => {
//     // Add an artificial sene with a model in scene_set with id 1.
//     const aSearchList = shallowMount(SearchList)
//
//     aSearchList.items = []
//
//     /* eslint-disable camelcase */
//     var scenario = { id: 123, active: true, scene_set: [{ id: 1 }] }
//
//     aSearchList.items.push(scenario)
//     /* eslint-enable camelcase */
//
//     assert.equal([scenario].length, aSearchList.selectedItems.length, 'selected models is correct.')
//     done()
//   })
//
//   it('Should be possible get selected runs - none selected', (done) => {
//     // Add an artificial sene with a model in scene_set with id 1.
//     const aSearchList = shallowMount(SearchList)
//
//     aSearchList.items = []
//
//     /* eslint-disable camelcase */
//     aSearchList.items.push({ id: 123, active: false, type: 'model' })
//     /* eslint-enable camelcase */
//
//     var models = _.filter(aSearchList.selectedItems, ['type', 'model'])
//
//     assert.isTrue((models.length === 0), 'selected items is correct.')
//     done()
//   })
//
//   it('check properties ', (done) => {
//     // const aSearchList = shallowMount(SearchList)
//
//     // Expected properties that should match with actual properties.
//     var expectedProps = {
//       'items': {
//         type: Array,
//         required: true
//       },
//       'models': {
//         type: Array,
//         required: true
//       }
//     }
//
//     // Without control key we expect only the last item selected.
//     assert.deepEqual(SearchList.options.props, expectedProps, 'Match default properties')
//
//     done()
//   })
// })
