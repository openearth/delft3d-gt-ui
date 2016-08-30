var exports = (function () {
  "use strict";

  var SceneCard = Vue.component("scenario-card", {
    template: "#template-scenario-card",
    props: {
      scene: {
        type: Object,
        required: true
      }
    }
  });
}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
