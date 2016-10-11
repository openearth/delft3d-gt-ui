var exports = (function () {
  "use strict";

  var ModelCard = Vue.component("model-card", {
    template: "#template-model-card",

    data: function() {
      return {
        selected: false
      };
    },

    props: {
      model: {
        required: true
      },
      selectable: {
        required: false
      }
    },

    methods: {
      toggleActive: function() {
        this.model.active = true;
        this.$dispatch("deactivate-all", this.model);
      }
    },

    events: {
      "deactivate": function(clickedmodel) {
        if (this.model !== clickedmodel) {
          this.model.active = false;
        }
      },
      "select-all": function () {
        this.selected = true;
      },
      "unselect-all": function () {
        this.selected = false;
      }
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
