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
  chai.shouldjs;

  // import components
  let store = require("../../app/scripts/store.js").store;
  let Viewer3DComponent = require("../../app/scripts/components/viewer3dcomponent.js").Viewer3DComponent;
  let viewer3dcomponent = new Viewer3DComponent({});

  // Viewer3D stub
  window.Viewer3D = sinon.stub();
  window.Viewer3D.viewer3D = sinon.stub();

  window.Viewer3D.viewer3D.prototype.camera = sinon.stub();
  window.Viewer3D.viewer3D.prototype.camera.alignToSide = sinon.stub();
  window.Viewer3D.viewer3D.prototype.camera.fit = sinon.stub();
  window.Viewer3D.viewer3D.prototype.camera.rotateToTopRightCorner = sinon.stub();
  window.Viewer3D.viewer3D.prototype.camera.stepDown = sinon.stub();
  window.Viewer3D.viewer3D.prototype.camera.stepUp = sinon.stub();
  window.Viewer3D.viewer3D.prototype.colorMap = sinon.stub();
  window.Viewer3D.viewer3D.prototype.colorMap.setColorMap = sinon.stub();
  window.Viewer3D.viewer3D.prototype.side = sinon.stub();
  window.Viewer3D.viewer3D.prototype.volume = sinon.stub();
  window.Viewer3D.viewer3D.prototype.volume.getDimensions = sinon.stub();
  window.Viewer3D.viewer3D.prototype.volume.refreshData = sinon.stub();
  window.Viewer3D.viewer3D.prototype.volume.setSlicePosition = sinon.stub();
  window.Viewer3D.viewer3D.prototype.volume.setTimeStep = sinon.stub();
  window.Viewer3D.viewer3D.prototype.dataSet = sinon.stub();
  window.Viewer3D.viewer3D.prototype.dataSet.load = sinon.spy(function (set, callback) {
    callback();
  });

  // test component
  describe("Viewer3DComponent", function() {

    beforeEach(function () {
      // import component
      sinon.spy($, "ajax");
      sinon.spy(Promise, "all");
      sinon.spy(Promise, "reject");
      sinon.spy(Promise, "resolve");
    });

    afterEach(function () {
      // Unwrap spies
      $.ajax.restore();
      Promise.all.restore();
      Promise.reject.restore();
      Promise.resolve.restore();
    });

    // ***************************************************************************** activeModel

    describe(".activeModel", function() {
      it("", function() {
        store.state.activeModelContainer = {
          "data": {
            "info": {
              "delta_fringe_images": {
                "images": ["image.jpg"]
              },
              "suid": "ID"
            },
            "state": "Finished",
            "parameters": {
              "composition": {
                "value": "medium-sand"
              }
            }
          }
        };
      });
    });

    // ***************************************************************************** start3dviewer

    describe(".start3dviewer()", function() {
      it("", function() {
        viewer3dcomponent.activated = true;
        viewer3dcomponent.start3dviewer();
      });
    });

    // ***************************************************************************** startOrLoad3dViewer

    describe(".startOrLoad3dViewer()", function() {
      it("", function() {
        viewer3dcomponent.startOrLoad3dViewer();
      });
    });

    // ***************************************************************************** addPoint

    describe(".addPoint()", function() {
      it("", function() {
        viewer3dcomponent.addPoint();
      });
    });

    // ***************************************************************************** camera

    describe(".camera()", function() {
      it("", function() {
        viewer3dcomponent.camera();
        viewer3dcomponent.camera("back");
        viewer3dcomponent.camera("bottom");
        viewer3dcomponent.camera("down");
        viewer3dcomponent.camera("fit");
        viewer3dcomponent.camera("front");
        viewer3dcomponent.camera("left");
        viewer3dcomponent.camera("reset");
        viewer3dcomponent.camera("right");
        viewer3dcomponent.camera("top");
        viewer3dcomponent.camera("up");
      });
    });

    // ***************************************************************************** goEnd

    describe(".goEnd()", function() {
      it("", function() {
        viewer3dcomponent.goEnd();
      });
    });

    // ***************************************************************************** goNext

    describe(".goNext()", function() {
      it("", function() {
        viewer3dcomponent.goNext();
      });
    });

    // ***************************************************************************** goPrev

    describe(".goPrev()", function() {
      it("", function() {
        viewer3dcomponent.goPrev();
      });
    });

    // ***************************************************************************** goStart

    describe(".goStart()", function() {
      it("", function() {
        viewer3dcomponent.goStart();
      });
    });

    // ***************************************************************************** initIonSliders

    describe(".initIonSliders()", function() {
      it("", function() {
        viewer3dcomponent.initIonSliders();
      });
    });

    // ***************************************************************************** initPickAColor

    describe(".initPickAColor()", function() {
      it("", function() {
        viewer3dcomponent.initPickAColor();
      });
    });

    // ***************************************************************************** loadData

    describe(".loadData()", function() {
      it("", function() {
        viewer3dcomponent.loadData();
      });
    });

    // ***************************************************************************** loadGradient

    describe(".loadGradient()", function() {
      it("", function() {
        viewer3dcomponent.loadGradient();
      });
    });

    // ***************************************************************************** loadSliders

    describe(".loadSliders()", function() {
      it("", function() {
        viewer3dcomponent.loadSliders();
      });
    });

    // ***************************************************************************** loadTime

    describe(".loadTime()", function() {
      it("", function() {
        viewer3dcomponent.loadTime();
      });
    });

    // ***************************************************************************** removePoint

    describe(".removePoint()", function() {
      it("", function() {
        viewer3dcomponent.removePoint();
      });
    });

    // ***************************************************************************** resetSliders

    describe(".resetSliders()", function() {
      it("", function() {
        viewer3dcomponent.resetSliders();
      });
    });

    // ***************************************************************************** resetViewer

    describe(".resetViewer()", function() {
      it("", function() {
        viewer3dcomponent.resetViewer();
      });
    });

    // ***************************************************************************** setTab

    describe(".setTab()", function() {
      it("", function() {
        viewer3dcomponent.setTab();
      });
    });

  });

})();
