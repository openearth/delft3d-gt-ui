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

      this.updateScenarios();



      // and fetch on every 10 seconds
      setInterval(
        // Call the update function:
        this.updateScenarios,
        // every 10 seconds
        10000
      );
    },
    route: {
      data: function(transition) {
        fetchScenarios()
          .then((data) => {
            this.scenarios = data;
            transition.next();
          });
      }
    },

    computed: {
      // Get the current selected scenarioid from the routing URL
      selectedScenarioId: {
        get: function() {
          return parseInt(this.$route.params.scenarioid);

        }
      },
      defaultRun: {
        get: function() {
          return -1;
        }
      },
      selectedScenario: {
        get: function() {
          // Get all scenarios with the current id
          var scenarios = _.filter(this.scenarios, ["id", this.selectedScenarioId]);
          // We want the first one
          var scenario = _.first(scenarios);

          return scenario;
        }
      }
    },


    methods: {
      // Update scenario list, this function is also called by a timer.
      updateScenarios: function() {
        fetchScenarios()
          .then((data) => {
            this.scenarios = data;
          });



      }
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
