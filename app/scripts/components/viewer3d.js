/* global Vue, viewer3D */
var exports = (function () {
  "use strict";

  var Viewer3D = Vue.component("viewer-threedee", {
    template: "#template-viewer-threedee",
    props: {
      model: {
        type: Object,
        default: function () {
          return { };
        }
      }
    },
    data: function() {
      return {
        "started": false
      }
    },
    ready: function () {
    },
    methods: {
      camera: function (side) {
        if (side === "back") {
          viewer3D.camera.alignToSide(viewer3D.side.BACK);
        }
        if (side === "bottom") {
          viewer3D.camera.alignToSide(viewer3D.side.BOTTOM);
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
      },
      start3dviewer: function () {
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
