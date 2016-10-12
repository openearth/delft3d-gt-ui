var exports = (function () {
  "use strict";
  // some models are not visible, but there is an id
  var hiddenModel = {
    name: "Hidden Model"
  };

  var ScenarioCard = Vue.component("scenario-card", {
    template: "#template-scenario-card",
    props: {
      scenario: {
        type: Object,
        required: true
      },
      selection: {
        type: Object,
        required: true
      }
    },
    computed: {
      models: {
        cache: false,
        get: function() {
          return _.map(this.scenario.scene_set, (modelId) => {
            if (modelId in store.state.models) {
              return store.state.models[modelId];
            } else {
              return hiddenModel;
            }
          });
        }
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
