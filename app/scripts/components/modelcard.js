var exports = (function () {
  "use strict";

  var ModelCard = Vue.component("model-card", {

    template: "#template-model-card",

    props: {
      model: {
        required: true
      }
    },

    computed: {
      selectable: function () {
        if(_.has(this.model, "data.shared")) {
          return (this.model.data.shared === "p");
        }
        return false;
      }
    },

    methods: {
      toggleActive: function() {
        this.model.active = true;
        this.$dispatch("activated", this.model);
      }
    },

    events: {
      "deactivate": function(clickedmodel) {
        if (this.model !== clickedmodel) {
          this.model.active = false;
        }
      },
      "select-all": function () {
        if (this.selectable) {
          this.model.selected = true;
        }
      },
      "unselect-all": function () {
        this.model.selected = false;
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
