/* global Vue, SearchColumn, ModelList, ModelDetails, deleteScenario */

var exports = (function () {
  "use strict";
  // Our homepage component
  var SearchColumns = Vue.component("search-columns", {
    // not much in here.
    template: "#template-search-columns",
    data: function() {
      return {
        modelid: -1
      };
    },
    components: {
      "search-details": SearchDetails,
      "model-list": ModelList,
      "model-details": ModelDetails
    },

    computed: {
    },

    route: {
      data: function(transition) {

        var newData = {
          modelid: parseInt(transition.to.params.modelid)
        };

        transition.next(newData);
      }
    },

    methods: {
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
