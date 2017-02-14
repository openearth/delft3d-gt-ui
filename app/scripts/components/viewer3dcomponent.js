/* global store, Vue */
var exports = (function () {
  "use strict";

  var Viewer3DComponent = Vue.component("viewer-threedee", {
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
        "to": 1,
        "viewer3d": undefined
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

        glcanvas.setAttribute("width", 0);
        glcanvas.setAttribute("height", 0);
        this.started = false;
      },
      curTimeStep: function () {
        this.viewer3d.volume.setTimeStep(this.curTimeStep);
        this.viewer3d.volume.refreshData();
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
        this.viewer3d.volume.setSlicePosition(this.viewer3d.side.LEFT, this.from - 1);
        this.viewer3d.volume.refreshData();
      },
      to: function () {
        this.viewer3d.volume.setSlicePosition(this.viewer3d.side.RIGHT, this.to - 1);
        this.viewer3d.volume.refreshData();
      }
    },
    ready: function () {
    },
    methods: {
      camera: function (side) {
        if (side === "back") {
          this.viewer3d.camera.alignToSide(this.viewer3d.side.BACK);
        }
        if (side === "bottom") {
          this.viewer3d.camera.alignToSide(this.viewer3d.side.BOTTOM);
        }
        if (side === "down") {
          this.viewer3d.camera.stepDown();
        }
        if (side === "fit") {
          this.viewer3d.camera.fit();
        }
        if (side === "front") {
          this.viewer3d.camera.alignToSide(this.viewer3d.side.FRONT);
        }
        if (side === "left") {
          this.viewer3d.camera.alignToSide(this.viewer3d.side.LEFT);
        }
        if (side === "reset") {
          this.viewer3d.camera.rotateToTopRightCorner();
          this.viewer3d.camera.fit();
        }
        if (side === "right") {
          this.viewer3d.camera.alignToSide(this.viewer3d.side.RIGHT);
        }
        if (side === "top") {
          this.viewer3d.camera.alignToSide(this.viewer3d.side.TOP);
        }
        if (side === "up") {
          this.viewer3d.camera.stepUp();
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

        document.getElementById("glcanvas").setAttribute("width", document.getElementById("viewer-3d").scrollWidth);
        document.getElementById("glcanvas").setAttribute("height", 400);

        /* eslint-disable */
        this.viewer3d = new window.Viewer3D.viewer3D();
        /* eslint-enable */

        this.viewer3d.dataSet.load({
          url: "/thredds/dodsC/files/" + this.model.suid + "/simulation/trim-medium-sand.nc",
          displacementVariable: "DP_BEDLYR",
          dataVariable: "LYRFRAC",
          bedLevelVariable: "DPS"
        }, () => {
          this.viewer3d.camera.rotateToTopRightCorner();
          this.viewer3d.camera.fit();
          this.dimensions = this.viewer3d.volume.getDimensions();
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
    Viewer3DComponent: Viewer3DComponent
  };

}());

// If we"re in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
