import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import chai, { expect } from 'chai'
import store from '../../src/store'

// setup chai
chai.use(chaiAsPromised)
chai.use(sinonChai)
// let should = chai.should()

// test component
describe('Store', function () {
  beforeEach(function () {
    // import component
    sinon.spy(Promise, 'all')
    sinon.spy(Promise, 'reject')
    sinon.spy(Promise, 'resolve')
  })

  afterEach(function () {
    // Unwrap spies
    Promise.all.restore()
    Promise.reject.restore()
    Promise.resolve.restore()
  })

  // ***************************************************************************** update()
  //
  describe('.updateParams()', function () {
    it('updates properly', function () {
      // can I call update method
      store.dispatch('updateParams', { key: 'val' })
      expect(store.state.params).to.have.property('key')
    })
  })
})
