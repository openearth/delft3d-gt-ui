/* global Vue, SearchDetails, ModelList, ModelDetails */

var exports = (function () {
  "use strict";
  // Our homepage component
  var SearchColumns = Vue.component("search-columns", {
    // not much in here.
    template: "#template-search-columns",
    data: function() {
      return {
      };
    },
    components: {
      "search-details": SearchDetails,
      "model-list": ModelList,
      "model-details": ModelDetails
    },

    methods: {
    },
    events: {
      "models-found": function (models) {
        var modelList = this.$refs.models;

        modelList.models = models;
      }
    }
  });

  return {
    SearchColumns: SearchColumns
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
