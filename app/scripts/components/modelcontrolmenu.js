/* global Vue startModels, stopModels, deleteModels */

var exports = (function () {
  "use strict";

  var ModelControlMenu = Vue.component("model-control-menu", {

    template: "#template-model-control-menu",
    data: function() {
      return {

      };
    },

    ready: function() {

      console.log(this.$refs);
    },


    props: {

      "selectedScenarios": {
        type: Array,
        required: true
      },

      "selectedRuns": {
        type: Array,
        required: true
      },

      "Models": {
        type: Array,
        required: true
      }
    },

    methods: {

      startSelectedModels: function() {

        // Start these models:
        startModels(this.selectedRuns);

      },

      stopSelectedModels: function() {

        // Stop models:
        stopModels(this.selectedRuns);
      },

      deleteSelectedModels: function() {

        // Delete models
        deleteModels(this.selectedRuns);
      },

      cloneScenario: function() {

        // Get scenario id:
        var scenarioId = this.selectedScenarios[0];

        // Find it:
        var scenario = _.find(this.Models, function(value) {

          // Is our id in this
          return (value.id === scenarioId);
        });

        console.log(scenario);

        // Ignore if we did not find anything.
        if (scenario === undefined) {
          return;
        }

        var parameters = _.assign(
          // create a new object (no data binding)
          {},
          // fill it with the parameters
          // TODO: replace by object parameters instead of list of parameters
          scenario.parameters
        );

        console.log("TEMPLATE:" + scenario.template);
        // These parameters are passed to the other view
        // alternative would be to store them in the app or to call an event
        var req = {
          name: "scenarios-create",
          params: {},
          query: {
            "template": scenario.template,
            "parameters": JSON.stringify(parameters),
            "name": _.get(scenario, "name")
          }
        };

        this.$router.go(req);


      }
    }

  });


  return {
    ModelControlMenu: ModelControlMenu
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
