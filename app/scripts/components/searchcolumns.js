/* global Vue, SearchDetails, SearchList, ModelDetails */

var exports = (function () {
  "use strict";
  // Our homepage component
  var SearchColumns = Vue.component("search-columns", {
    // not much in here.
    template: "#template-search-columns",
    data: function() {
      return {
        // items that were found
        items: []
      };
    },
    components: {
      "search-details": SearchDetails,
      "search-list": SearchList,
      "model-details": ModelDetails
    },
    ready: function() {
      // TODO, consistent naming
      this.$on("items-found", function(items) {
        this.$set("items", items);
      });
    },
    route: {
      data: function(transition) {

        // Refresh data immediatly if user gets here.
        this.$broadcast("updateSearch");
        transition.next();
      }
    },

    computed: {
      activeItem: {
        cache: false,
        get: function() {
          if (_.has(this.$refs, ["searchList", "selectedModel"])) {
            return this.$refs.searchList.selectedModel;
          } else {
            return null;
          }

        }}
    },

    methods: {

      // Reset all input fields.
      resetFields: function() {
        // Empty all fields:
        $(".search-details input[type='text'], .search-details input[type=date]").val("");

        // Todo, reset sliders to min/max
        var sliders = $(".ion-range");

        $.each(sliders, function(key, slider) {
          var irs = $(slider).data("ionRangeSlider");

          // Reset /from & to to min/max.
          irs.update({
            from: irs.options.min,
            to: irs.options.max
          });
        });

        // Enable all items in the select pickers chooser.
        var pickers = $(".select-picker");

        // This if statement is necessary for the testing library. Bit redundant, but it does not hurt to test anyway.
        if (pickers.selectpicker !== undefined) {
          pickers.selectpicker("refresh");
          pickers.selectpicker("selectAll");
        }

        // Domain selection boxes - enable all.
        $(".domain-selection-box input[type='checkbox']").prop("checked", "checked");

        this.$broadcast("clearSearch");

      }

    }
  });

  return {
    SearchColumns: SearchColumns
  };

}());

// If were in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
