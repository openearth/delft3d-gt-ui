/* global Vue */

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
    route: {
      data: function(transition) {
        console.log("new finder column data", this.$children);
        var modelDetails = this.$children[2];
        var newData = {
          modelid: parseInt(transition.to.params.modelid)
        };

        modelDetails.id = newData.modelid;
        transition.next(newData);
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
