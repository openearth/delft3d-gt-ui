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

    },


    props: {
      selection: {
        type: Object,
        required: true
      },
      models: {
        type: Object
      }
    },
    computed: {
      selectedModels: {
        cache: false,
        get: function() {
          return _.pick(this.models, this.selection.selectedModelIds);
        }

      }
    },
    methods: {

      deleteSelectedScenario: () => {

        // Right now we use the old dialog from before. Should be turned into a component.
        // User accepts deletion:
        $("#dialog-remove-scenario-response-accept").on("click", () => {

          this.selectedScenarios.forEach(function(scenario) {
            deleteScenario(scenario.id)
              .then(() => {
                this.$parent.$broadcast("show-alert", {
                  message: "Deleting scenario... It might take a moment before the view is updated.",
                  showTime: 5000,
                  type: "success"
                });

              })


              .catch(e => {
                console.warn("scenario deletion failed", e);
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
        startModels(_.map(this.selectedModels, "id"));

      },

      stopSelectedModels: function() {

        // Stop models:
        stopModels(_.map(this.selectedModels, "id"));
      },

      deleteSelectedModels: function() {

        // Delete models
        deleteModels(_.map(this.selectedModels, "id"));
      },

      cloneScenario: function() {

        var scenario = this.selectedScenarios[0];

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
