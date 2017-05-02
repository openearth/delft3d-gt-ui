/*eslint no-unused-expressions: 0*/

(function() {
  "use strict";

  // Import chai
  let chai = require("chai");
  let chaiAsPromised = require("chai-as-promised");
  let sinon = require("sinon");
  let sinonChai = require("sinon-chai");

  // setup chai
  chai.use(chaiAsPromised);
  chai.use(sinonChai);
  let should = chai.should();

  // import component
  let store = require("../../app/scripts/store.js").store;

  // test component
  describe("Store", function() {

    beforeEach(function () {
      // import component
      sinon.spy($, "ajax");
      sinon.spy(Promise, "all");
      sinon.spy(Promise, "reject");
      sinon.spy(Promise, "resolve");
      // sinon.spy(window, "open");
    });

    afterEach(function () {
      // Unwrap spies
      $.ajax.restore();
      Promise.all.restore();
      Promise.reject.restore();
      Promise.resolve.restore();
      // window.open.restore();
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
          template: [],
          users: []
          /*eslint-enable camelcase*/
        }, traditional: true, dataType: "json"});
      });
    });

    // ***************************************************************************** updateModelContainers()

    describe(".updateModelContainers()", function() {
      it("updates properly", function() {
        // make sure there are no model containers
        store.state.models = [];
        store.updateModelContainers();
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

    // ***************************************************************************** publishModel()

    describe(".publishModel()", function() {
      it("rejects properly with no model", function(done) {
        // call with erronous input
        store.publishModel().should.be.rejected.notify(done);
      });

      it("rejects properly with no target", function(done) {
        // add models and update containers
        store.state.models = [{"id": "a"}];
        store.updateModelContainers();
        store.state.activeModelContainer = store.state.modelContainers[0];

        // call with erronous input
        store.publishModel(store.state.activeModelContainer).should.be.rejected.notify(done);
      });

      it("rejects properly with wrong target", function(done) {
        // add models and update containers
        store.state.models = [{"id": "a"}];
        store.updateModelContainers();
        store.state.activeModelContainer = store.state.modelContainers[0];

        // call with erronous input
        store.publishModel(store.state.activeModelContainer, "whooogarghblblbl").should.be.rejected.notify(done);
      });

      it("publishes properly", function() {
        // add models and update containers
        store.state.models = [{"id": "a"}];
        store.updateModelContainers();
        store.state.activeModelContainer = store.state.modelContainers[0];

        // call with correct input
        store.publishModel(store.state.activeModelContainer, "company");
        $.ajax.should.have.been.called;
      });
    });

    // ***************************************************************************** statusLevel()

    describe(".statusLevel()", function() {
      it("converts model states to label strings", function() {
        // no status should default to "info"
        store.state.models = [{"id": "a"}];
        store.updateModelContainers();
        store.state.modelContainers[0].statusLevel().should.equal("info");

        // a weird status should default to "info"
        store.state.models = [{"id": "a", "state": "weird"}];
        store.updateModelContainers();
        store.state.modelContainers[0].statusLevel().should.equal("info");

        // a "Finished" status should default to "success"
        store.state.models = [{"id": "a", "state": "Finished"}];
        store.updateModelContainers();
        store.state.modelContainers[0].statusLevel().should.equal("success");

        // a "Finished" status should default to "warning"
        store.state.models = [{"id": "a", "state": "Idle: waiting for user input"}];
        store.updateModelContainers();
        store.state.modelContainers[0].statusLevel().should.equal("warning");
      });
    });

    // ***************************************************************************** resetSelectedModels()

    describe(".resetSelectedModels()", function() {
      it("resets nothing when no models are selected", function(done) {
        store.state.models = [];
        store.updateModelContainers();

        let pr = store.resetSelectedModels();

        Promise.all.should.have.been.called;
        pr.should.become([]).notify(done);
      });

      it("resets a model when this model is selected", function(done) {
        // stub resetModel
        sinon.stub(store, "resetModel").returns(Promise.resolve({"status": "ok"}));

        store.state.models = [{"id": "a"}, {"id": "b"}];
        store.updateModelContainers();
        store.state.modelContainers[0].selected = true;

        let pr = store.resetSelectedModels();

        Promise.all.should.have.been.called;
        pr.should.become([{"status": "ok"}]).notify(done);

        // unstub resetModel
        store.resetModel.restore();
      });

      it("resets multiple models when multiple models are selected", function(done) {
        // stub resetModel
        sinon.stub(store, "resetModel").returns(Promise.resolve({"status": "ok"}));

        store.state.models = [{"id": "a"}, {"id": "b"}];
        store.updateModelContainers();
        store.state.modelContainers[0].selected = true;
        store.state.modelContainers[1].selected = true;

        let pr = store.resetSelectedModels();

        Promise.all.should.have.been.called;
        pr.should.become([{"status": "ok"}, {"status": "ok"}]).notify(done);

        // unstub resetModel
        store.resetModel.restore();
      });
    });

    // ***************************************************************************** startSelectedModels()

    describe(".startSelectedModels()", function() {
      it("starts nothing when no models are selected", function(done) {
        store.state.models = [];
        store.updateModelContainers();

        let pr = store.startSelectedModels();

        Promise.all.should.have.been.called;
        pr.should.become([]).notify(done);
      });

      it("starts a model when this model is selected", function(done) {
        // stub startModel
        sinon.stub(store, "startModel").returns(Promise.resolve({"status": "ok"}));

        store.state.models = [{"id": "a"}, {"id": "b"}];
        store.updateModelContainers();
        store.state.modelContainers[0].selected = true;

        let pr = store.startSelectedModels();

        Promise.all.should.have.been.called;
        pr.should.become([{"status": "ok"}]).notify(done);

        // unstub startModel
        store.startModel.restore();
      });

      it("starts multiple models when multiple models are selected", function(done) {
        // stub startModel
        sinon.stub(store, "startModel").returns(Promise.resolve({"status": "ok"}));

        store.state.models = [{"id": "a"}, {"id": "b"}];
        store.updateModelContainers();
        store.state.modelContainers[0].selected = true;
        store.state.modelContainers[1].selected = true;

        let pr = store.startSelectedModels();

        Promise.all.should.have.been.called;
        pr.should.become([{"status": "ok"}, {"status": "ok"}]).notify(done);

        // unstub startModel
        store.startModel.restore();
      });
    });

    // ***************************************************************************** startSelectedModels()

    describe(".startSelectedModels()", function() {
      it("starts nothing when no models are selected", function(done) {
        store.state.models = [];
        store.updateModelContainers();

        let pr = store.startSelectedModels();

        Promise.all.should.have.been.called;
        pr.should.become([]).notify(done);
      });

      it("starts a model when this model is selected", function(done) {
        // stub startModel
        sinon.stub(store, "startModel").returns(Promise.resolve({"status": "ok"}));

        store.state.models = [{"id": "a"}, {"id": "b"}];
        store.updateModelContainers();
        store.state.modelContainers[0].selected = true;

        let pr = store.startSelectedModels();

        Promise.all.should.have.been.called;
        pr.should.become([{"status": "ok"}]).notify(done);

        // unstub startModel
        store.startModel.restore();
      });

      it("starts multiple models when multiple models are selected", function(done) {
        // stub startModel
        sinon.stub(store, "startModel").returns(Promise.resolve({"status": "ok"}));

        store.state.models = [{"id": "a"}, {"id": "b"}];
        store.updateModelContainers();
        store.state.modelContainers[0].selected = true;
        store.state.modelContainers[1].selected = true;

        let pr = store.startSelectedModels();

        Promise.all.should.have.been.called;
        pr.should.become([{"status": "ok"}, {"status": "ok"}]).notify(done);

        // unstub startModel
        store.startModel.restore();
      });
    });

    // ***************************************************************************** stopSelectedModels()

    describe(".stopSelectedModels()", function() {
      it("stops nothing when no models are selected", function(done) {
        store.state.models = [];
        store.updateModelContainers();

        let pr = store.stopSelectedModels();

        Promise.all.should.have.been.called;
        pr.should.become([]).notify(done);
      });

      it("stops a model when this model is selected", function(done) {
        // stub stopModel
        sinon.stub(store, "stopModel").returns(Promise.resolve({"status": "ok"}));

        store.state.models = [{"id": "a"}, {"id": "b"}];
        store.updateModelContainers();
        store.state.modelContainers[0].selected = true;

        let pr = store.stopSelectedModels();

        Promise.all.should.have.been.called;
        pr.should.become([{"status": "ok"}]).notify(done);

        // unstub stopModel
        store.stopModel.restore();
      });

      it("stops multiple models when multiple models are selected", function(done) {
        // stub stopModel
        sinon.stub(store, "stopModel").returns(Promise.resolve({"status": "ok"}));

        store.state.models = [{"id": "a"}, {"id": "b"}];
        store.updateModelContainers();
        store.state.modelContainers[0].selected = true;
        store.state.modelContainers[1].selected = true;

        let pr = store.stopSelectedModels();

        Promise.all.should.have.been.called;
        pr.should.become([{"status": "ok"}, {"status": "ok"}]).notify(done);

        // unstub stopModel
        store.stopModel.restore();
      });
    });

    // ***************************************************************************** deleteSelectedModels()

    describe(".deleteSelectedModels()", function() {
      it("deletes nothing when no models are selected", function(done) {
        store.state.models = [];
        store.updateModelContainers();

        let pr = store.deleteSelectedModels();

        Promise.all.should.have.been.called;
        pr.should.become([]).notify(done);
      });

      it("deletes a model when this model is selected", function(done) {
        // stub deleteModel
        sinon.stub(store, "deleteModel").returns(Promise.resolve({"status": "ok"}));

        store.state.models = [{"id": "a"}, {"id": "b"}];
        store.updateModelContainers();
        store.state.modelContainers[0].selected = true;

        let pr = store.deleteSelectedModels();

        Promise.all.should.have.been.called;
        pr.should.become([{"status": "ok"}]).notify(done);

        // unstub deleteModel
        store.deleteModel.restore();
      });

      it("deletes multiple models when multiple models are selected", function(done) {
        // stub deleteModel
        sinon.stub(store, "deleteModel").returns(Promise.resolve({"status": "ok"}));

        store.state.models = [{"id": "a"}, {"id": "b"}];
        store.updateModelContainers();
        store.state.modelContainers[0].selected = true;
        store.state.modelContainers[1].selected = true;

        let pr = store.deleteSelectedModels();

        Promise.all.should.have.been.called;
        pr.should.become([{"status": "ok"}, {"status": "ok"}]).notify(done);

        // unstub deleteModel
        store.deleteModel.restore();
      });
    });

    // ***************************************************************************** shareSelectedModels()

    describe(".shareSelectedModels()", function() {
      it("shares nothing when no models are selected", function(done) {
        store.state.models = [];
        store.updateModelContainers();
        store.shareSelectedModels().should.be.rejected.notify(done);
      });

      it("shares nothing when no publish target is given", function(done) {
        store.state.models = [{"id": "a"}, {"id": "b"}];
        store.updateModelContainers();
        store.state.modelContainers[0].selected = true;
        store.shareSelectedModels().should.be.rejected.notify(done);
      });

      it("shares nothing when the wrong publish target is given", function(done) {
        store.state.models = [{"id": "a"}, {"id": "b"}];
        store.updateModelContainers();
        store.state.modelContainers[0].selected = true;
        store.shareSelectedModels("the wrong target").should.be.rejected.notify(done);
      });

      it("shares nothing when no models are selected and the company publish target is given", function(done) {
        store.state.models = [];
        store.updateModelContainers();
        store.shareSelectedModels("company").should.be.rejected.notify(done);
      });

      it("shares a model the models is selected and the company publish target is given", function() {
        store.state.models = [{"id": "a"}, {"id": "b"}];
        store.updateModelContainers();
        store.state.modelContainers[0].selected = true;

        store.shareSelectedModels("company");

        $.ajax.should.have.been.called;
      });
    });

    // ***************************************************************************** downloadSelectedModels()

    describe(".downloadSelectedModels()", function() {
      it("downloads nothing when no models are selected", function(done) {
        store.state.models = [];
        store.updateModelContainers();

        let p = store.downloadSelectedModels();

        // window.open.should.have.not.been.called;
        p.should.be.rejected.notify(done);
      });

      it("downloads nothing when no selections are given", function(done) {
        store.state.models = [{"id": "a"}, {"id": "b"}];
        store.updateModelContainers();
        store.state.modelContainers[0].selected = true;

        let p = store.downloadSelectedModels();

        // window.open.should.have.not.been.called;
        p.should.be.rejected.notify(done);
      });

      it("downloads nothing when the wrong input is given", function(done) {
        store.state.models = [{"id": "a"}, {"id": "b"}];
        store.updateModelContainers();
        store.state.modelContainers[0].selected = true;

        let p = store.downloadSelectedModels("the wrong input");

        // window.open.should.have.not.been.called;
        p.should.be.rejected.notify(done);
      });

      it("downloads nothing when the all selections are false", function(done) {
        store.state.models = [{"id": "a"}, {"id": "b"}];
        store.updateModelContainers();
        store.state.modelContainers[0].selected = true;

        let p = store.downloadSelectedModels({"option": {"active": false}});

        // window.open.should.have.not.been.called;
        p.should.be.rejected.notify(done);
      });

      it("downloads something when a model is selected and a download option is selected", function() {
        store.state.models = [{"id": "a"}, {"id": "b"}];
        store.updateModelContainers();
        store.state.modelContainers[0].selected = true;

        store.downloadSelectedModels({"option": {"active": true}});

        // window.open.should.have.been.called;
      });

      it("downloads nothing when a model is selected but all selections are false", function(done) {
        store.state.models = [];
        store.updateModelContainers();

        let p = store.downloadSelectedModels({"option": {"active": false}});

        // window.open.should.have.not.been.called;
        p.should.be.rejected.notify(done);
      });
    });

  });

})();
