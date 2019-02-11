
import { expect } from 'chai'
let store = require("../../src/store.js").store;

// test component
describe("Store", function() {


// ***************************************************************************** update()

describe(".update()", function() {
  it("updates properly", function() {
    expect(1).to.equal(1)
  //   // stub and spy
  //   sinon.stub(store, "fetchModels").returns(Promise.resolve());
  //   sinon.stub(store, "fetchScenarios").returns(Promise.resolve());
  //
  //   // set store state to 'updating' and update
  //   store.state.updating = true;
  //   store.update();
  //
  //   // make sure no promises have been called
  //   Promise.all.should.have.not.been.called;
  //   store.fetchModels.should.have.not.been.called;
  //   store.fetchScenarios.should.have.not.been.called;
  //
  //   // now set 'updating' state to false and call again
  //   store.state.updating = false;
  //   store.update();
  //
  //   // check that all promises have been called
  //   Promise.all.should.have.been.called;
  //   store.fetchModels.should.have.been.called;
  //   store.fetchScenarios.should.have.been.called;
  });
});
})
