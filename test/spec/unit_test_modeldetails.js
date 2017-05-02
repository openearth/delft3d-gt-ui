/*eslint no-unused-expressions: 0*/
/*eslint-disable camelcase*/

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
  chai.should();

  // import components
  let store = require("../../app/scripts/store.js").store;
  let ModelDetails = require("../../app/scripts/components/modeldetails.js").ModelDetails;
  let modelDetails = new ModelDetails({});

  // stub publishDialog
  function createDialog(name) {
    let el = document.createElement("confirm-dialog");

    modelDetails.$children.push(el);
    el.$options = {"name": "confirm-dialog"};
    el.dialogId = name;
    el.showAlert = sinon.stub();
    el.show = sinon.stub();
    el.hide = sinon.stub();

    return el;
  }
  let publishDialog = createDialog("publish");
  let deleteDialog = createDialog("delete");
  let resetDialog = createDialog("reset");

  // test component
  describe("ModelDetails", function() {

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

    // ***************************************************************************** dateCreatedText

    describe(".dateCreatedText()", function() {
      it("", function() {
        store.state.activeModelContainer = undefined;
        modelDetails.dateCreatedText.should.equal("");

        store.state.activeModelContainer = {"data": {"date_created": ""}};
        modelDetails.dateCreatedText.should.equal("");

        store.state.activeModelContainer = {"data": {"date_created": "2003-02-01T00:00:00.000000Z"}};
        modelDetails.dateCreatedText.should.equal("1/2/2003");

        store.state.activeModelContainer = undefined;
      });
    });

    // ***************************************************************************** isReadOnly

    describe(".isReadOnly", function() {
      it("", function() {
        store.state.activeModelContainer = undefined;
        modelDetails.isReadOnly.should.equal(false);

        store.state.activeModelContainer = {"data": {}};
        modelDetails.isReadOnly.should.equal(false);

        store.state.activeModelContainer = {"data": {"shared": "p"}};
        modelDetails.isReadOnly.should.equal(false);

        store.state.activeModelContainer = {"data": {"shared": "anything but p"}};
        modelDetails.isReadOnly.should.equal(true);

        store.state.activeModelContainer = undefined;
      });
    });

    // ***************************************************************************** isIdle

    describe(".isIdle", function() {
      it("", function() {
        store.state.activeModelContainer = undefined;
        modelDetails.isIdle.should.equal(false);

        store.state.activeModelContainer = {"data": {}};
        modelDetails.isIdle.should.equal(false);

        store.state.activeModelContainer = {"data": {"state": "Idle"}};
        modelDetails.isIdle.should.equal(false);  // it checks whether the string is exactly as below

        store.state.activeModelContainer = {"data": {"state": "Idle: waiting for user input"}};
        modelDetails.isIdle.should.equal(true);

        store.state.activeModelContainer = undefined;
      });
    });

    // ***************************************************************************** isRunning

    describe(".isRunning", function() {
      it("", function() {
        store.state.activeModelContainer = undefined;
        modelDetails.isRunning.should.equal(false);

        store.state.activeModelContainer = {"data": {}};
        modelDetails.isRunning.should.equal(false);

        store.state.activeModelContainer = {"data": {"state": "Running"}};
        modelDetails.isRunning.should.equal(false);  // it checks whether the string is exactly as below

        store.state.activeModelContainer = {"data": {"state": "Running simulation"}};
        modelDetails.isRunning.should.equal(true);

        store.state.activeModelContainer = undefined;
      });
    });

    // ***************************************************************************** isFinished

    describe(".isFinished", function() {
      it("", function() {
        store.state.activeModelContainer = undefined;
        modelDetails.isFinished.should.equal(false);

        store.state.activeModelContainer = {"data": {}};
        modelDetails.isFinished.should.equal(false);

        store.state.activeModelContainer = {"data": {"state": "Finished"}};
        modelDetails.isFinished.should.equal(true);

        store.state.activeModelContainer = undefined;
      });
    });

    // ***************************************************************************** isQueued

    describe(".isQueued", function() {
      it("", function() {
        store.state.activeModelContainer = undefined;
        modelDetails.isQueued.should.equal(false);

        store.state.activeModelContainer = {"data": {}};
        modelDetails.isQueued.should.equal(false);

        store.state.activeModelContainer = {"data": {"state": "Queued"}};
        modelDetails.isQueued.should.equal(true);

        store.state.activeModelContainer = undefined;
      });
    });

    // ***************************************************************************** shareLevelText

    describe(".shareLevelText", function() {
      it("", function() {
        store.state.activeModelContainer = undefined;
        modelDetails.shareLevelText.should.equal("-");

        store.state.activeModelContainer = {"data": {"shared": "p"}};
        modelDetails.shareLevelText.should.equal("private");

        store.state.activeModelContainer = {"data": {"shared": "c"}};
        modelDetails.shareLevelText.should.equal("company");

        store.state.activeModelContainer = {"data": {"shared": "w"}};
        modelDetails.shareLevelText.should.equal("world");

        store.state.activeModelContainer = {"data": {"shared": "u"}};
        modelDetails.shareLevelText.should.equal("updating");

        store.state.activeModelContainer = undefined;
      });
    });

    // ***************************************************************************** outdated

    describe(".outdated", function() {
      it("", function() {
        store.state.activeModelContainer = undefined;
        modelDetails.outdated.should.equal(false);

        store.state.activeModelContainer = {"data": {"outdated": undefined}};
        modelDetails.outdated.should.equal(false);

        store.state.activeModelContainer = {"data": {"outdated": true}};
        modelDetails.outdated.should.equal(true);

        store.state.activeModelContainer = undefined;
      });
    });

    // ***************************************************************************** downloadFiles()

    describe(".downloadFiles()", function() {
      it("", function() {
        modelDetails.downloadFiles();
        // window.open.should.have.not.been.called;
        modelDetails.sharedState.activeModelContainer = {"id": "a"};
        modelDetails.selectedDownloads.export_d3dinput = true;
        modelDetails.downloadFiles();
        // window.open.should.have.been.calledWith("/api/v1/scenes/a/export/?format=json&options=export_d3dinput");
      });
    });

    // ***************************************************************************** hasPostProcessData()

    describe(".hasPostProcessData()", function() {
      it("", function() {
        modelDetails.hasPostProcessData().should.equal(false);
        modelDetails.sharedState.activeModelContainer = {"id": "a"};
        modelDetails.hasPostProcessData().should.equal(false);
        modelDetails.sharedState.activeModelContainer = {"id": "a", "data": {"info": {"postprocess_output": {"stuff": "value"}}}};
        modelDetails.hasPostProcessData().should.equal(true);
      });
    });

    // ***************************************************************************** publishModel()

    describe(".publishModel()", function() {
      it("", function() {
        sinon.stub(store, "publishModel");
        modelDetails.sharedState.activeModelContainer = {"id": "a"};
        modelDetails.publishModel("level");
        publishDialog.showAlert.should.have.been.called;
        publishDialog.show.should.have.been.called;
        publishDialog.onConfirm();
        publishDialog.hide.should.have.been.called;
        store.publishModel.should.have.been.calledWith({"id": "a"}, "level");
        store.publishModel.restore();
      });
    });

    // ***************************************************************************** removeModel()

    describe(".removeModel()", function() {
      it("", function() {
        sinon.stub(store, "deleteModel");
        modelDetails.sharedState.activeModelContainer = {"id": "a"};
        modelDetails.removeModel();
        deleteDialog.showAlert.should.have.been.called;
        deleteDialog.show.should.have.been.called;
        deleteDialog.onConfirm();
        deleteDialog.hide.should.have.been.called;
        store.deleteModel.should.have.been.calledWith({"id": "a"});
        store.deleteModel.restore();
      });
    });

    // ***************************************************************************** resetModel()

    describe(".resetModel()", function() {
      it("", function() {
        sinon.stub(store, "resetModel");
        modelDetails.sharedState.activeModelContainer = {"id": "a"};
        modelDetails.resetModel();
        resetDialog.showAlert.should.have.been.called;
        resetDialog.show.should.have.been.called;
        resetDialog.onConfirm();
        resetDialog.hide.should.have.been.called;
        store.resetModel.should.have.been.calledWith({"id": "a"});
        store.resetModel.restore();
      });
    });

    // ***************************************************************************** startModel()

    describe(".startModel()", function() {
      it("", function() {
        sinon.stub(store, "startModel");
        modelDetails.sharedState.activeModelContainer = {"id": "a"};
        modelDetails.startModel();
        store.startModel.should.have.been.calledWith({"id": "a"});
        store.startModel.restore();
      });
    });

    // ***************************************************************************** stopModel()

    describe(".stopModel()", function() {
      it("", function() {
        sinon.stub(store, "stopModel");
        modelDetails.sharedState.activeModelContainer = {"id": "a"};
        modelDetails.stopModel();
        store.stopModel.should.have.been.calledWith({"id": "a"});
        store.stopModel.restore();
      });
    });

    // ***************************************************************************** toggle()

    describe(".toggle()", function() {
      it("", function() {
        modelDetails.selectedDownloads.export_images.should.equal(false);
        modelDetails.toggle("export_images", false);
        modelDetails.selectedDownloads.export_images.should.equal(false);
        modelDetails.toggle("export_images", true);
        modelDetails.selectedDownloads.export_images.should.equal(true);
        modelDetails.toggle("export_images", false);
        modelDetails.selectedDownloads.export_images.should.equal(true);
        modelDetails.toggle("export_images", true);
        modelDetails.selectedDownloads.export_images.should.equal(false);
      });
    });

    // ***************************************************************************** doNothing()

    describe(".doNothing()", function() {
      it("", function() {
        modelDetails.doNothing().should.equal(false);
      });
    });

  });

})();
