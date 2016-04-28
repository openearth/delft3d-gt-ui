/* global Vue, ScenarioList, ModelList, ModelDetails */

var exports = (function () {
  "use strict";
  // Our homepage component
  var FinderColumns = Vue.component("finder-columns", {
    // not much in here.
    template: "#template-finder-columns",
    data: function() {
      return {
        modelid: -1
      };
    },
    components: {
      "scenario-list": ScenarioList,
      "model-list": ModelList,
      "model-details": ModelDetails
    },

    computed: {
      // Get the current selected scenarioid from the routing URL
      selectedScenarioId: {
        get: function() {
          return parseInt(this.$route.params.scenarioid);

        }
      }
    },

    route: {
      data: function(transition) {
        console.log("new finder column data", this.$children);

        // Lookup a child by name:
        var modelDetails = this.getChildByName("model-details"); //this.$children[2]; //

        var newData = {
          modelid: parseInt(transition.to.params.modelid)
        };

        modelDetails.id = newData.modelid;
        transition.next(newData);
      }
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
    }

  });

  return {
    FinderColumns: FinderColumns
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
