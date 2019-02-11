
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import { expect } from 'chai'
import chai from 'chai'
let store = require('../../src/store.js').store

// setup chai
chai.use(chaiAsPromised)
chai.use(sinonChai)
let should = chai.should()

// test component
describe('Store', function () {
// ***************************************************************************** update()

  describe('.update()', function () {
    it('updates properly', function () {
      expect(1).to.equal(1)
      // stub and spy
      sinon.stub(store, 'fetchModels').returns(Promise.resolve())
      sinon.stub(store, 'fetchScenarios').returns(Promise.resolve())

      // set store state to 'updating' and update
      store.state.updating = true
      store.dispatch('update')

      // make sure no promises have been called
      Promise.all.should.have.not.been.called
      store.dispatch('fetchModels').should.have.not.been.called
      store.dispatch('fetchScenarios').should.have.not.been.called

      // now set 'updating' state to false and call again
      store.state.updating = false
      store.dispatch('update')

      // check that all promises have been called
      Promise.all.should.have.been.called
      store.dispatch('fetchModels').should.have.been.called
      store.dispatch('fetchScenarios').should.have.been.called
    })
  })
})
