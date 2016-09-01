var exports = (function () {
  "use strict";

  var SceneCard = Vue.component("scenario-card", {
    template: "#template-scenario-card",
    props: {
      scenario: {
        type: Object,
        required: true
      }
    },
    methods: {
      toggleActive: function(scenario) {
        // we can only toggle on the parent, because we have to clear other actives
        this.$parent.toggleActive(scenario);
      },
      collapse: function(evt) {
        // toggle the collapsed icon
        $(evt.target).toggleClass("collapsed");
        // lookup the target
        var t = $(evt.target).data("target");
        // lookup the target element
        var el = $("#" + t);

        // collapse it
        $(el).collapse("toggle");
      }
    }
  });

  return {
    SceneCard: SceneCard
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
