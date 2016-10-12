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
        // clear the array
        this.selection.selectedModelIds.splice(0);
        // select all models
        _.each(this.scenario.scene_set, (modelId) => {
          this.selection.selectedModelIds.push(modelId);
        });
      },
      someModelsSelected: function() {
        return (_.intersection(this.scenario.scene_set, this.selection.selectedModelIds)).length > 0;

      },
      allModelsSelected: function() {
        // all models are in selectedModelIds
        return !(_.difference(this.scenario.scene_set, this.selection.selectedModelIds));
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
