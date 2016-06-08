/* global Vue, SearchDetails, SearchList, ModelDetails */

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
      "search-list": SearchList,
      "model-details": ModelDetails
    },


    methods: {

      // Get a child by name, such that we do not have a fixed index.
      getChildByName: function(name) {
        var that = this;

        for(var i = 0; i < that.$children.length; i++) {

          // Check if name matches:
          if (that.$children[i].$options.name === name) {
            return that.$children[i];
          }
        }

        return null;
      }
    },
    events: {

      // Got some search results:
      "models-found": function (models) {
        var modelList = this.$refs.models;

        modelList.filter = "search";
        modelList.models = models;
      },

      // User clicked on a result item:
      "models-selected": function(id) {
        var modelDetails = this.getChildByName("model-details"); //this.$children[2]; //

        modelDetails.id = id;

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
