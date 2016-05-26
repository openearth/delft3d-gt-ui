/* global Vue, ScenarioList, ModelList, ModelDetails, deleteScenario */

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

    computed: {
      // Get the current selected scenarioid from the routing URL
      selectedScenarioId: {
        get: function() {
          return parseInt(this.$route.params.scenarioid);

        }
      },
      scenarioList: {
        get: function() {
          // lookup scenarioList component
          // it is the first
          var scenarioList = _.first(
            // of the child components
            _.filter(
              this.$children,
              // filtered with name ScenarioList
              function(x) {
                return x.constructor.name === "ScenarioList";
              }
            )
          );

          // found it
          return scenarioList;
        }
      }
    },

    route: {
      data: function(transition) {

        // Lookup a child by name:
        var modelDetails = this.getChildByName("model-details"); //this.$children[2]; //

        var newData = {
          modelid: parseInt(transition.to.params.modelid)
        };

        modelDetails.id = newData.modelid;
        transition.next(newData);
      }
    },

    methods: {
      // Get a child by name, such that we do not have a fixed index.
      getChildByName: function(name) {
        var that = this;

        for(var i = 0; i < that.$children.length; i++) {

          // Check if name matches:
          if (that.$children[i].$options.name === name) {
            return that.$children[i];
          }
        }

        return null;
      },
      cloneScenario: function() {

        // TODO: this should be in the scenario, but the button is in finder-columns
        var scenario = this.scenarioList.selectedScenario;
        var parameters = _.assign(
          // create a new object (no data binding)
          {},
          // fill it with the parameters
          // TODO: replace by object parameters instead of list of parameters
          _.get(scenario.parameters, 0)
        );

        // These parameters are passed to the other view
        // alternative would be to store them in the app or to call an event
        var req = {
          name: "scenarios-create",
          params: {},
          query: {
            "parameters": JSON.stringify(parameters),
            "name": _.get(this.scenarioList.selectedScenario, "name")
          }
        };

        this.$router.go(req);
      },
      // Remove item, based on incoming modelinfo.
      removeScenario: function() {

        var that = this;

        $("#dialog-remove-scenario-name").empty();

        // User accepts deletion:
        $("#dialog-remove-scenario-response-accept").on("click", () => {
          var deletedId = this.selectedScenarioId;

          var options = {};

          deleteScenario(deletedId, options)
            .then(function(data) {
              console.log("scenario deleted from server", deletedId, "data:", data);

              that.$parent.$broadcast("show-alert", { message: "Deleting scenario... It might take a moment before the view is updated.", showTime: 5000, type: "success"});

            })
            .catch(e => {
              console.log("scenario deletion failed", e);
            });

          // Hide dialog when user presses this accept.:
          $("#dialog-confirm-delete-scenario").modal("hide");


        });

        // Show the dialog:
        $("#dialog-confirm-delete-scenario").modal({});
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
