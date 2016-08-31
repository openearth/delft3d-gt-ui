var exports = (function () {
  "use strict";

  var ModelCard = Vue.component("model-card", {
    template: "#template-model-card",
    props: {
      model: {
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
