/* globals fetchScenarios */
var exports = (function () {
  "use strict";
  /* global Vue */

  // register the grid component
  var ScenarioList = Vue.component("scenario-list", {

    template: "#template-scenario-list",

    data: function() {
      return {
        scenarios: []
      };
    },

    ready: function() {
      fetchScenarios()
        .then((data) => {
          this.scenarios = data.scenario_list;
        });

      // and fetch on every 10 seconds
      setInterval(
        // create a callback for every second
        () => {
          // fetch the scenarios
          fetchScenarios()
            .then((data) => {
              this.scenarios = data.scenario_list;
            });
        },
        // every 10 seconds
        10000
      );
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

    computed: {
      // Get the current selected scenarioid from the routing URL
      selectedScenarioId: {
        get: function() {
          return this.$route.params.scenarioid;

        }
      },
      defaultRun: {
        get: function() {
          return -1;
        }
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
