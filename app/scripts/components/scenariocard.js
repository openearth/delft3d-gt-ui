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
    methods: {
      collapse: function(e) {
        e.stopPropagation();
        $("#collapse-" + this.scenario.id).collapse("toggle");
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
        return _.every(this.scenario.models, ["selected", true]);
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
