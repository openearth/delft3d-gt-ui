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

        // We cannot clone from a run. We need to select a scenario!!
       // console.log("disabled for a moment");
        //return;

        // Find selected run
        // var selectedRunId = this.selectedRuns[0];
        // var scenario = null;

        // _.find(this.Models, function(value) {

        //   // Is our id in this
        //   return  (_.indexOf(value.scene_set, selectedRunId) !== -1)
        // });

/*
        // Find scenario that we clone
        var scenario = this.scenarioList.selectedScenario;

        var parameters = _.assign(
          // create a new object (no data binding)
          {},
          // fill it with the parameters
          // TODO: replace by object parameters instead of list of parameters
          scenario.parameters
        );

        // These parameters are passed to the other view
        // alternative would be to store them in the app or to call an event
        var req = {
          name: "scenarios-create",
          params: {},
          query: {
            "template": scenario.template,
            "parameters": JSON.stringify(parameters),
            "name": _.get(this.scenarioList.selectedScenario, "name")
          }
        };

        this.$router.go(req);

*/
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
