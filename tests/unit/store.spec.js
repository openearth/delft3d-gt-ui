import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import chai from 'chai'
// import store, { update } from '../../src/store'

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
  // describe('.update()', function () {
  //   it('updates properly', function () {
  //     // stub and spy
  //     sinon.stub(store, 'dispatch').returns(Promise.resolve())
  //
  //     // set store state to 'updating' and update
  //     store.state.updating = true
  //     update(store)
  //
  //     // make sure no promises have been called
  //     Promise.all.should.not.have.been.called
  //     store.dispatch.should.have.not.been.called
  //
  //     // // now set 'updating' state to false and call again
  //     store.state.updating = false
  //     update(store)
  //
  //     // // check that all promises have been called
  //     Promise.all.should.have.been.called
  //     expect(store.dispatch).to.have.been.calledWith('fetchModels')
  //     expect(store.dispatch).to.have.been.calledWith('fetchScenarios')
  //   })
  // })
})
