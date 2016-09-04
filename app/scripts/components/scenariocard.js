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
      toggleActive: function(item, evt) {
        item.active = !item.active;
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
