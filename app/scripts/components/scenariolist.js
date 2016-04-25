/* globals fetchModels */
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

      // // and fetch on every 10 seconds
      // setInterval(
      //   // create a callback for every second
      //   () => {
      //     // fetch the models
      //     fetchScenarios()
      //       .then((data) => {
      //         this.scenarios = data;
      //       });
      //   },
      //   // every 10 seconds
      //   10000
      // );

    },
    route: {
      data: function(transition) {
        // fetchScenarios()
        //   .then(
        //     (json) => {
        //       // copy old data and set model
        //       var data = this.$data;

        //       data.scenarios = json;
        //       // transition to this new data;
        //       transition.next(data);
        //     }
        //   );
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
