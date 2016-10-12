var exports = (function () {
  "use strict";

  var ModelCard = Vue.component("model-card", {
    template: "#template-model-card",
    props: {
      selection: {
        type: Object,
        required: true
      },
      model: {
        type: Object,
        required: true
      },
      selectable: {
        type: Boolean,
        required: false
      }
    },
    computed: {
      active: {
        get: () => {
          return this.selection.activeModelId === this.model.id;
        }
      },
      selected: {
        get: () => {
          _.includes(this.selection.selectedModelIds, this.model.id);
        }
      }
    },
    methods: {
      toggleActive: function() {
        if (this.selection.activeModelId !== this.model.id) {
          this.selection.activeModelId = this.model.id;
        } else {
          this.selection.activeModelId = null;
        }
      }
    },

    events: {
    }

  });

  return {
    ModelCard: ModelCard
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
