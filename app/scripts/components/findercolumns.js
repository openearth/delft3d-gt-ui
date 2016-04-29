/* global Vue, ScenarioList, ModelList, ModelDetails */

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
      }
    },

    route: {
      data: function(transition) {
        console.log("new finder column data", this.$children);

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

      // Remove item, based on incoming modelinfo.
      removeScenario: function() {

        // keep track of the scenario before deletion
        var scenarioId = this.scenario;
        var that = this;

        $("#dialog-remove-scenario-name").html("");
        // Do we also remove all the additional files? This is based on the checkmark.
        // if deletefiles is true, we will tell the server that we want to remove these files.
        var deletefiles = true; // We do not provide this option anymore. LEaving it here shortly if someone changes his or her mind: $("#simulation-control-check-delete-files").is(":checked");

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

          // key values correspond to url parameters which are lowercase
          var params = {
            scenarioid: scenarioId
          };

        });

        // Show the dialog:
        $("#dialog-confirm-delete-scenario").modal({});
      },

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
