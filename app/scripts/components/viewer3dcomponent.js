/* global store, Vue */
var exports = (function () {
  "use strict";

  var Viewer3DComponent = Vue.component("viewer-threedee", {
    template: "#template-viewer-threedee",
    props: {
      activated: {
        type: Boolean,
        default: function () {
          return false;
        }
      },
      model: {
        type: Object,
        default: function () {
          return {};
        }
      }
    },
    data: function() {
      return {
        "canvasStyle": {
          "height": "10px"
        },
        "curFrameLength": 0,
        "curSedimentClass": undefined,
        "curSuid": undefined,
        "curTimeStep": 0,
        "dataSetVariables": {
          "bedLevelVariable": "DPS",
          "dataVariable": "MSED",
          "displacementVariable": "DP_BEDLYR"
        },
        "dimensions": {"x": 10, "y": 10, "z": 10, "t": 10, "segments": 10},
        "gradient": [
          {"color": "542437", "position": 1.0},
          {"color": "d95b43", "position": 0.5},
          {"color": "ecd078", "position": 0.2},
          {"color": "c02942", "position": 0.1},
          {"color": "53777a", "position": 0.0}
        ],
        "gradientStyle": {
          "background": "#fff",
          "height": "100%"
        },
        "height": 0,
        "sharedState": store.state,
        "started": false,
        "slices": {
          "x": {"from": 1, "to": 1},
          "y": {"from": 1, "to": 1},
          "z": {"from": 1, "to": 1}
        },
        "svgStyle": {
          "height": "100%"
        },
        "tab": "slices",
        "viewer3d": undefined,
        "width": 0
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
      activated: function () {
        this.loadData();
      },
      activeModel: {
        "deep": true,
        "handler": function () {
          let suid = _.get(this.activeModel, "data.suid");
          let sedimentClass = _.get(this.activeModel, "data.parameters.composition.value");
          let maxTimeStepIndex = _.get(this.activeModel, "data.info.delta_fringe_images.files", []).length - 1;  // obtain max TimeStep index based on number of Delta Fringe images

          if (suid !== this.curSuid && maxTimeStepIndex !== -1 && sedimentClass !== undefined) {
            this.curSuid = suid;
            this.curFrameLength = this.curTimeStep = maxTimeStepIndex;  // if the model is not finished, do not show final maxTimeStepIndex (as it will not render)
            this.curSedimentClass = sedimentClass;
            this.startOrLoad3dViewer();
          }

          this.initPickAColor();
          this.initIonSliders();
        }
      },
      dataSetVariables: {
        "deep": true,
        "handler": function () {
          this.loadData();
        }
      },
      curTimeStep: {
        "deep": false,
        "handler": function () {
          this.loadTime();
        }
      },
      dimensions: {
        "deep": true,
        "handler": function () {
          this.resetSliders();
        }
      },
      gradient: {
        "deep": true,
        "handler": function () {
          let newGrad = _.reverse(_.sortBy(_.clone(this.gradient), "position"));

          // cap position values
          _.each(newGrad, (p) => {
            p.position = Math.max(Math.min(p.position, 1), 0);
          });

          if (_.isEqual(this.gradient, newGrad)) {
            this.loadGradient();
          } else {
            this.gradient = newGrad;
          }
        }
      },
      slices: {
        "deep": true,
        "handler": function () {
          this.loadSliders();
        }
      }
    },
    ready: function () {
      // get reference element from model-details
      let width = document.getElementById("col-glcanvas-container-reference").scrollWidth;

      this.width = width;
      this.height = Math.floor(width / 1.6);  // golden ratio
      this.canvasStyle.height = this.height + "px";
      this.gradientStyle.height = this.height + "px";
      this.svgStyle.height = this.height + "px";
    },
    methods: {
      addPoint: function () {
        this.gradient.push(_.clone(_.last(this.gradient)));
        this.initPickAColor();
      },
      camera: function (side) {
        if (_.isUndefined(this.viewer3d)) {
          return;
        }

        if (side === "back") {
          this.viewer3d.camera.alignToSide(this.viewer3d.side.BACK, true);
        }
        if (side === "bottom") {
          this.viewer3d.camera.alignToSide(this.viewer3d.side.BOTTOM, true);
        }
        if (side === "down") {
          this.viewer3d.camera.stepDown();
        }
        if (side === "fit") {
          this.viewer3d.camera.fit();
        }
        if (side === "front") {
          this.viewer3d.camera.alignToSide(this.viewer3d.side.FRONT, true);
        }
        if (side === "left") {
          this.viewer3d.camera.alignToSide(this.viewer3d.side.LEFT, true);
        }
        if (side === "reset") {
          this.resetViewer();
        }
        if (side === "right") {
          this.viewer3d.camera.alignToSide(this.viewer3d.side.RIGHT, true);
        }
        if (side === "top") {
          this.viewer3d.camera.alignToSide(this.viewer3d.side.TOP, true);
        }
        if (side === "up") {
          this.viewer3d.camera.stepUp();
        }
      },
      goEnd: function () {
        this.curTimeStep = this.curFrameLength;
      },
      goNext: function () {
        this.curTimeStep = Math.min(this.curTimeStep + 1, this.curFrameLength);
      },
      goPrev: function () {
        this.curTimeStep = Math.max(this.curTimeStep - 1, 0);
      },
      goStart: function () {
        this.curTimeStep = 0;
      },
      initIonSliders: function () {
        this.$nextTick(() => {
          /*eslint-disable camelcase*/
          if ($(".ion-range").ionRangeSlider !== undefined) {
            _.each(["x", "y", "z"], (d) => {

              $(".ion-range.slice-" + d + "-w").ionRangeSlider({
                skin: "round",
                "drag_interval": true,
                "onChange": (data) => {
                  _.set(this, ["slices", d, "from"], data.from);
                  _.set(this, ["slices", d, "to"], data.to);
                }
              });
            });
          }
          /*eslint-enable camelcase*/
        });
      },
      initPickAColor: function () {
        this.$nextTick(() => {
          $(".pick-a-color").each((i, e) => {
            if ($(e).parent(".pick-a-color-markup").length === 0) {
              $(e).pickAColor({
                "inlineDropdown": true
              });
            }
          });
        });
      },
      loadData: function () {
        if (!this.activated || _.isUndefined(this.viewer3d)) {
          return;
        }
        try {
          if (this.curSuid !== undefined && this.curSedimentClass !== undefined) {
            this.viewer3d.dataSet.load({
              url: "/thredds/dodsC/files/" + this.curSuid + "/simulation/trim-" + this.curSedimentClass + ".nc",
              displacementVariable: this.dataSetVariables.displacement,
              dataVariable: this.dataSetVariables.data,
              bedLevelVariable: this.dataSetVariables.bedLevel
            }, () => {
              this.dimensions = this.viewer3d.volume.getDimensions();
              this.loadGradient();
              this.loadTime();
              this.resetViewer();
            });
          }
        } catch (err) {
          console.error(err);
          return;
        }
      },
      loadGradient: function () {
        if (_.isUndefined(this.viewer3d)) {
          return;
        }

        let colors = _.reverse(_.map(this.gradient, (c) => {
          return "#" + c.color;
        }));
        let positions = _.reverse(_.map(this.gradient, "position"));

        // check if all colors are according to color format
        let colorsOk = _.every(colors, function (c) {
          return /^#[0-9a-fA-F]{6}$/.test(c);
        });

        if (!colorsOk && colors.length === positions.length) {
          return;
        }

        let posColors = _.reverse(_.map(colors, (c, i) => {
          return c + " " + Math.floor((1 - positions[i]) * 100) + "%";
        }));

        if (colors.length > 1) {
          this.gradientStyle.background = "linear-gradient(" + _.join(posColors, ",") + ")";
        }
        if (colors.length === 1) {
          this.gradientStyle.background = colors[0];
        }
        if (colors.length === 0) {
          this.gradientStyle.background = "#000000";
        }

        this.viewer3d.colorMap.setColorMap(
          colors,
          positions
        );
        this.refreshData();
      },
      loadSliders: function () {
        if (_.isUndefined(this.viewer3d)) {
          return;
        }

        this.viewer3d.volume.setSlicePosition(this.viewer3d.side.LEFT, this.slices.x.from - 1);
        this.viewer3d.volume.setSlicePosition(this.viewer3d.side.RIGHT, this.slices.x.to - 2);

        this.viewer3d.volume.setSlicePosition(this.viewer3d.side.BACK, this.slices.y.to - 1);
        this.viewer3d.volume.setSlicePosition(this.viewer3d.side.FRONT, this.slices.y.from - 1);

        this.viewer3d.volume.setSlicePosition(this.viewer3d.side.TOP, this.slices.z.from - 1);
        this.viewer3d.volume.setSlicePosition(this.viewer3d.side.BOTTOM, this.slices.z.to - 1);

        this.refreshData();
      },
      loadTime: function () {
        if (_.isUndefined(this.viewer3d)) {
          return;
        }

        this.viewer3d.volume.setTimeStep(this.curTimeStep);

        this.refreshData();
      },
      refreshData: _.debounce(function () {
        if (_.isUndefined(this.viewer3d)) {
          return;
        }

        this.viewer3d.volume.refreshData();
      }, 500),
      removePoint: function (index) {
        this.gradient.splice(index, 1);
      },
      resetSliders: function () {
        _.each(["x", "y", "z"], (d) => {
          let val = _.get(this.dimensions, d);

          // don't show dummy values on max X
          if (d === "x") {
            val--;
          }

          _.set(this.slices, [d, "from"], 1);
          _.set(this.slices, [d, "to"], val);

          let ionRangeFinderData = $(".ion-range.slice-" + d + "-w").data("ionRangeSlider");

          if (ionRangeFinderData !== undefined) {
            ionRangeFinderData.update({
              "min": 1, "max": val, "from": 1, "to": val
            });
          }
        });
      },
      resetViewer: function () {
        if (_.isUndefined(this.viewer3d)) {
          return;
        }

        this.resetSliders();
        this.loadSliders();
        this.refreshData();

        this.viewer3d.camera.rotateToTopRightCorner(true);
        this.viewer3d.camera.fit();
      },
      setTab: function (tab) {
        this.tab = tab;
      },
      start3dviewer: function () {
        if (this.started || !this.isFinished) {
          return;
        }
        this.started = true;

        /* eslint-disable */
        this.viewer3d = new window.Viewer3D.viewer3D();
        /* eslint-enable */

        this.loadData();
      },
      startOrLoad3dViewer: function () {
        if (this.curSuid !== undefined) {
          if (!this.started) {
            this.start3dviewer();
          } else {
            this.loadData();
          }
        }
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
