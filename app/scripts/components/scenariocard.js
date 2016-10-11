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
        var someSelected = false;

        _.each(this.$refs.modelcards, (modelcard) => {
          someSelected = someSelected || modelcard.selected;
        });

        return someSelected;
      },
      allModelsSelected: function() {
        var allSelected = true;

        _.each(this.$refs.modelcards, (modelcard) => {
          allSelected = allSelected && modelcard.selected;
        });

        return allSelected;
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
