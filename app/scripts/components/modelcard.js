var exports = (function () {
  "use strict";

  var ModelCard = Vue.component("model-card", {
    template: "#template-model-card",
    props: {
      model: {
        required: true
      }
    },
    methods: {
      toggleActive: function(model) {
        // we can only toggle on the parent, because we have to clear other actives
        this.$parent.toggleActive(model);
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
