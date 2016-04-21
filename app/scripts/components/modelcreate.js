/* globals submitModel */

var exports = (function () {
  "use strict";

  var ModelCreate = Vue.component("model-create", {
    template: "#template-model-create",
    // Show the details of one model
    // Doesn't have a model yet....
    data: function() {
      return {
        model: {
          name: "",
          id: 0,
          params: {

          },
          results: [],
          state: "PENDING",
          log: ""

        }
      };
    },
    methods: {
      submit: function() {
        // this is now in ui.js
        // TODO: move ui parts here, fetching to model.js and validating also here.
        submitModel();
        console.log("validating", this.$data);
        console.log("submitting", JSON.stringify(this.$data));
      }
    }

  });

  // export objects
  return {
    ModelCreate: ModelCreate
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
