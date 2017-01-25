/*eslint no-unused-expressions: 0*/

(function() {
  "use strict";

  // Import chai
  let chai = require("chai");
  let sinon = require("sinon");
  let sinonChai = require("sinon-chai");

  // setup chai
  chai.use(sinonChai);
  let should = chai.should();

  // import component
  let store;

  // test component
  describe("Store", function() {

    beforeEach(function () {
      // import component
      store = require("../../app/scripts/store.js").store;
      sinon.spy(Promise, "all");
      sinon.spy($, "ajax");
    });

    afterEach(function () {
      // Unwrap spies
      Promise.all.restore();
      $.ajax.restore();
    });

    // ***************************************************************************** update()

    describe(".update()", function() {
      it("updates properly", function() {
        // stub and spy
        sinon.stub(store, "fetchModels").returns(Promise.resolve());
        sinon.stub(store, "fetchScenarios").returns(Promise.resolve());

        // set store state to 'updating' and update
        store.state.updating = true;
        store.update();

        // make sure no promises have been called
        Promise.all.should.have.not.been.called;
        store.fetchModels.should.have.not.been.called;
        store.fetchScenarios.should.have.not.been.called;

        // now set 'updating' state to false and call again
        store.state.updating = false;
        store.update();

        // check that all promises have been called
        Promise.all.should.have.been.called;
        store.fetchModels.should.have.been.called;
        store.fetchScenarios.should.have.been.called;
      });
    });

    // ***************************************************************************** updateUser()

    describe(".updateUser()", function() {
      it("updates properly", function() {
        // stub and spy
        sinon.spy(store, "fetchUser");

        // call update user
        store.updateUser();

        // check
        store.fetchUser.should.have.been.called;
        $.ajax.should.have.been.called;
        $.ajax.should.have.been.calledWith({url: "/api/v1/users/me/", data: {
          /*eslint-disable camelcase*/
          created_after: "",
          created_before: "",
          parameter: [],
          search: "",
          shared: [],
          started_after: "",
          started_before: "",
          template: [],
          users: [],
          versions: "{}"
          /*eslint-enable camelcase*/
        }, traditional: true, dataType: "json"});
      });
    });

    // ***************************************************************************** updateModelContainers()

    describe(".updateModelContainers()", function() {
      it("updates properly", function() {
        // make sure there are no model containers
        store.state.modelContainers.length.should.be.equal(0);

        // change models and call update
        store.state.models = [{"id": "a"}];
        store.updateModelContainers();

        // check if store created modelcontainers
        store.state.modelContainers.length.should.be.equal(1);

        // change models and call update
        store.state.models = [{"id": "a"}, {"id": "b"}];
        store.state.activeModelContainer = store.state.modelContainers[0];
        store.updateModelContainers();

        // check if store created modelcontainers
        store.state.modelContainers.length.should.be.equal(2);

        // change models and call update
        store.state.models = [{"id": "c"}];
        store.updateModelContainers();

        // check if store created modelcontainers
        store.state.modelContainers.length.should.be.equal(1);
        should.not.exist(store.state.activeModelContainer);
      });

    });

    // ***************************************************************************** updateScenarioContainers()

    describe(".updateScenarioContainers()", function() {
      it("updates properly", function() {
        // make sure there are no model containers
        store.state.scenarioContainers.length.should.be.equal(0);

        // change models and call update
        store.state.scenarios = [{"id": "a"}];
        store.updateScenarioContainers();

        // check if store created modelcontainers
        store.state.scenarioContainers.length.should.be.equal(1);

        // change models and call update
        store.state.scenarios = [{"id": "a"}, {"id": "b"}];
        store.updateScenarioContainers();

        // check if store created modelcontainers
        store.state.scenarioContainers.length.should.be.equal(2);

        // change models and call update
        store.state.scenarios = [{"id": "c"}];
        store.updateScenarioContainers();

        // check if store created modelcontainers
        store.state.scenarioContainers.length.should.be.equal(1);
      });
    });

    // ***************************************************************************** deleteModel()

    describe(".deleteModel()", function() {
      it("deletes properly", function() {
        let model = {"id": "a"};
        let scenario = {"id": "a", "scene_set": ["a"]};

        // add models and update containers
        store.state.models = [model];
        store.updateModelContainers();
        store.state.scenarios = [scenario];
        store.updateScenarioContainers();

        // check if all containers are there
        store.state.modelContainers.length.should.be.equal(1);
        store.state.scenarioContainers.length.should.be.equal(1);
        store.state.scenarioContainers[0].models.length.should.be.equal(1);

        // set an active model
        store.state.activeModelContainer = store.state.modelContainers[0];

        // delete this active model
        store.deleteModel(store.state.activeModelContainer);

        // check if all is deleted properly
        store.state.modelContainers.length.should.be.equal(0);
        store.state.scenarioContainers[0].models.length.should.be.equal(0);
        should.not.exist(store.state.activeModelContainer);
        $.ajax.should.have.been.called;
      });
    });

  });

})();
