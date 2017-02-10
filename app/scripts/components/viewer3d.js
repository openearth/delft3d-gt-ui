/* global Vue, viewer3D */
var exports = (function () {
  "use strict";

  var Viewer3D = Vue.component("viewer-threedee", {
    template: "#template-viewer-threedee",
    props: {
      model: {
        type: Object,
        default: function () {
          return {};
        }
      }
    },
    data: function() {
      return {
        "curTimeStep": 0,
        "dimensions": {"x": 10, "y": 10, "z": 10, "t": 10, "segments": 10},
        "from": 0,
        "sharedState": store.state,
        "started": false,
        "to": 1
      };
    },
    computed: {
      activeModel: {
        cached: false,
        get: function () {
          return this.sharedState.activeModelContainer;
        }
      },
      isFinished: {
        cache: false,
        get: function () {
          return _.get(this.activeModel, "data.state", "") === "Finished";
        }
      }
    },
    watch: {
      activeModel: function () {
        let glcanvas = document.getElementById("glcanvas");
        let glcanvasContainer = document.getElementById("glcanvas-hidden-container");

        glcanvasContainer.appendChild(glcanvas);
        glcanvas.setAttribute("width", 0);
        glcanvas.setAttribute("height", 0);

        this.started = false;
      },
      curTimeStep: function () {
        viewer3D.volume.setTimeStep(this.curTimeStep);
        viewer3D.volume.refreshData();
      },
      dimensions: function () {
        $(".ion-range.slice-w").data("ionRangeSlider").update({
          "min": 1,
          "max": this.dimensions.x,
          "from": 1,
          "to": this.dimensions.x
        });
        $(".ion-range.slice-p").data("ionRangeSlider").update({
          "min": 1,
          "max": this.dimensions.x,
          "from": (this.dimensions.x / 2)
        });
      },
      from: function () {
        viewer3D.volume.setSlicePosition(viewer3D.side.LEFT, this.from - 1);
        viewer3D.volume.refreshData();
      },
      to: function () {
        viewer3D.volume.setSlicePosition(viewer3D.side.RIGHT, this.to - 1);
        viewer3D.volume.refreshData();
      }
    },
    methods: {
      camera: function (side) {
        if (side === "back") {
          viewer3D.camera.alignToSide(viewer3D.side.BACK);
        }
        if (side === "bottom") {
          viewer3D.camera.alignToSide(viewer3D.side.BOTTOM);
        }
        if (side === "down") {
          viewer3D.camera.stepDown();
        }
        if (side === "fit") {
          viewer3D.camera.fit();
        }
        if (side === "front") {
          viewer3D.camera.alignToSide(viewer3D.side.FRONT);
        }
        if (side === "left") {
          viewer3D.camera.alignToSide(viewer3D.side.LEFT);
        }
        if (side === "reset") {
          viewer3D.camera.rotateToTopRightCorner();
          viewer3D.camera.fit();
        }
        if (side === "right") {
          viewer3D.camera.alignToSide(viewer3D.side.RIGHT);
        }
        if (side === "top") {
          viewer3D.camera.alignToSide(viewer3D.side.TOP);
        }
        if (side === "up") {
          viewer3D.camera.stepUp();
        }
      },
      goEnd: function () {
        this.curTimeStep = 15;
      },
      goNext: function () {
        this.curTimeStep = Math.min(this.curTimeStep + 1, 15);
      },
      goPrev: function () {
        this.curTimeStep = Math.max(this.curTimeStep - 1, 0);
      },
      goStart: function () {
        this.curTimeStep = 0;
      },
      start3dviewer: function () {
        if (!this.isFinished) {
          return;
        }

        this.started = true;

        let glcanvas = document.getElementById("glcanvas");
        let glcanvasContainer = document.getElementById("glcanvas-container");

        glcanvasContainer.appendChild(glcanvas);
        glcanvas.setAttribute("width", glcanvasContainer.scrollWidth);
        glcanvas.setAttribute("height", glcanvasContainer.scrollWidth / 1.6);

        viewer3D.dataSet.load({
          url: "/thredds/dodsC/files/" + this.model.suid + "/simulation/trim-medium-sand.nc",
          displacementVariable: "DP_BEDLYR",
          dataVariable: "LYRFRAC",
          bedLevelVariable: "DPS"
        }, () => {
          viewer3D.camera.rotateToTopRightCorner();
          viewer3D.camera.fit();
          this.dimensions = viewer3D.volume.getDimensions();
        });

        this.$nextTick(() => {

          /*eslint-disable camelcase*/
          if ($(".ion-range").ionRangeSlider !== undefined) {
            $(".ion-range.slice-w").ionRangeSlider({
              onChange: (data) => {
                $(".ion-range.slice-p").data("ionRangeSlider").update({
                  "from": Math.floor((data.from + data.to) / 2)
                });
                this.from = data.from;
                this.to = data.to;
              }
            });

            $(".ion-range.slice-p").ionRangeSlider({
              onChange: (data) => {
                let range = Math.floor((this.to - this.from) / 2);

                $(".ion-range.slice-w").data("ionRangeSlider").update({
                  "from": data.from - range,
                  "to": data.from + range
                });

                this.from = data.from - range;
                this.to = data.from + range;
              }
            });

          }
          /*eslint-enable camelcase*/

        });
      }
    }
  });

  return {
    Viewer3D: Viewer3D
  };

}());

// If we"re in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
