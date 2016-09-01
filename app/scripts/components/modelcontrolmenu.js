/* global Vue startModels, stopModels, deleteModels, router,  deleteScenario */

var exports = (function () {
  "use strict";

  var ModelControlMenu = Vue.component("model-control-menu", {

    template: "#template-model-control-menu",
    data: function() {
      return {
        deleteDialog: null
      };
    },

    ready: function() {

      console.log(this.$refs);
    },


    props: {
      items: {
        type: Array,
        required: true
      }
    },
    computed: {
      selectedModels: function() {
        return _.filter(this.items, ["selected", true, "type", "models"]);
      },
      selectedScenarios: function() {
        console.log("selected scenarios", this);
        return _.filter(this.items, ["selected", true, "type", "scenarios"]);
      }
    },
    methods: {

      deleteSelectedScenario: function() {

        // Right now we use the old dialog from before. Should be turned into a component.
        var that = this;

        // User accepts deletion:
        $("#dialog-remove-scenario-response-accept").on("click", () => {

          this.selectedScenarios.forEach(function(id) {
            deleteScenario(id)
              .then(() => {
                that.$parent.$broadcast("show-alert", {
                  message: "Deleting scenario... It might take a moment before the view is updated.",
                  showTime: 5000,
                  type: "success"
                });

                // Immediatly refresh screen:
                that.$root.$broadcast("updateSearch");

              })


              .catch(e => {
                console.log("scenario deletion failed", e);
              });

            // Hide dialog when user presses this accept.:
            $("#dialog-confirm-delete-scenario").modal("hide");

          });

        });

        // Show the dialog:
        $("#dialog-confirm-delete-scenario").modal({});


      },

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

        router.go(req);


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
