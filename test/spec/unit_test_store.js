(function() {
  "use strict";

  // Import chai.
  let chai = require("chai");
  let should = chai.should();
  let expect = chai.expect();

  // import component
  let store = require("../../app/scripts/store.js").store;

  // test component
  describe("Store", function() {

    describe("property", function() {

      beforeEach(function() {
        sinon.stub(Promise, "all");
      });

      it("works", function() {
        store.state.updating = true;
        let a = store.update();

        should.not.exist(a);
        expect(Promise.all.calledOnce).to.be.false;
      });

    });

  });

})();
