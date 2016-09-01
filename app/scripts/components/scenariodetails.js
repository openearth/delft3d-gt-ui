/* global  */
var exports = (function () {
  "use strict";

  var ScenarioDetails = Vue.component("scenario-details", {
    template: "#template-scenario-details",

    data: function() {
      return {
      };

    },
    ready: function() {
    },
    computed: {
    },
    route: {
      data: function(transition) {
        transition.next();
      },
      activate: function(transition) {
        transition.next();
      }
    },
    methods: {
    }
  });

  return {
    ScenarioDetails: ScenarioDetails
  };

}());


// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
