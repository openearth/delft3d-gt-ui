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
        get: function () {
          var isActive = false;

          if (this.selection.activeModelId === null) {
            isActive = false;
          } else {
            if (this.selection.activeModelId === this.model.id) {
              isActive = true;
            }
          }
          return isActive;
        }
      },
      selected: {
        cache: false,
        get: function () {
          return _.includes(this.selection.selectedModelIds, this.model.id);
        },
        set: (val) => {
          if (val) {
            // if selected is not set
            if (!_.includes(this.selection.selectedModelIds, this.model.id)) {
              this.selection.selectedModelIds.push(this.model.id);
            }
          } else {
            // deselect
            _.pull(this.selection.selectedModelIds, this.model.id);
          }
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
