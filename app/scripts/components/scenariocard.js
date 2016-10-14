/* global store, getDialog, router  */
var exports = (function () {
  "use strict";

  var ScenarioCard = Vue.component("scenario-card", {
    template: "#template-scenario-card",
    props: {
      scenario: {
        type: Object,
        required: true
      }
    },
    computed: {
      hasModels: function () {
        console.log(this.scenario);
        return this.scenario.models.length > 0;
      },
      modelStatuses: function () {
        var array = _.map(this.scenario.models, function (model) {
          return {state: model.data.state};
        });

        _.each(array, function (status) {
          status.width = 100 / array.length;
        });
        array = _.sortBy(array, function(status) {
          if (status.state === "Finished") {
            return 0;
          }
          if (status.state === "Running simulation...") {
            return 1;
          }
          if (status.state === "Queued") {
            return 2;
          }
          if (status.state === "Idle: waiting for user input") {
            return 3;
          }
          return 2;
        });
        return array;
      }
    },
    methods: {
      clone: function(e) {
        e.stopPropagation();

        // Clone this scenario
        var parameters = _.assign(
          // create a new object (no data binding)
          {},
          // fill it with the parameters
          // TODO: replace by object parameters instead of list of parameters
          this.scenario.data.parameters
        );

        // These parameters are passed to the other view
        // alternative would be to store them in the app or to call an event
        var req = {
          name: "scenarios-create",
          params: {},
          query: {
            "template": this.scenario.data.template,
            "parameters": JSON.stringify(parameters),
            "name": _.get(this.scenario.data, "name")
          }
        };

        router.go(req);


      },
      collapse: function(e) {
        e.stopPropagation();
        $("#collapse-" + this.scenario.id).collapse("toggle");
      },
      delete: function(e) {
        e.stopPropagation();

        // Get a confirm dialog
        this.deleteDialog = getDialog(this, "confirm-dialog", "delete-scenario-" + this.scenario.id);


        console.log(this.deleteDialog);

        this.deleteDialog.onConfirm = function() {
          store.deleteScenario(this.scenario);

          this.deleteDialog.hide();

        }.bind(this);

        // Show the dialog:
        this.deleteDialog.show();

      },
      selectAll: function(e) {
        e.stopPropagation();
        $("#collapse-" + this.scenario.id).collapse("show");

        if (this.allModelsSelected()) {
          this.$broadcast("unselect-all");
        } else {
          this.$broadcast("select-all");
        }
      },
      someModelsSelected: function() {
        return _.some(this.scenario.models, ["selected", true]);
      },
      allModelsSelected: function() {
        return _.every(_.filter(this.scenario.models, ["data.shared", "p"]), ["selected", true]);
      }
    }
  });

  return {
    ScenarioCard: ScenarioCard
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
