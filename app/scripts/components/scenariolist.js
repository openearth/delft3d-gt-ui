/* globals fetchScenarios */
var exports = (function () {
  "use strict";
  /* global Vue */

  // register the grid component
  var ScenarioList = Vue.component("scenario-list", {

    template: "#template-scenario-list",

    data: function() {
      return {
        scenarios: ["a", "b", "c"]
      };
    },

    ready: function() {
      fetchScenarios()
        .then((data) => {
          this.scenarios = data.scenario_list;
        });
    },
    route: {
      data: function(transition) {
        fetchScenarios()
          .then((data) => {
            this.scenarios = data.scenario_list;
            transition.next();
          });
      }
    },
    methods: {
    }
  });

  return {
    ScenarioList: ScenarioList
  };
}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
