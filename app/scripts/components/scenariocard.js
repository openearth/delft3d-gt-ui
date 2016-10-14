/* global store  */
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
      collapse: function(e) {
        e.stopPropagation();
        $("#collapse-" + this.scenario.id).collapse("toggle");
      },
      delete: function(e) {
        e.stopPropagation();
        store.deleteScenario(this.scenario);
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
