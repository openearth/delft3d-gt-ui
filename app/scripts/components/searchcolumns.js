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
        items: [],
        models: []
      };
    },
    components: {
      "search-details": SearchDetails,
      "search-list": SearchList,
      "model-details": ModelDetails
    },
    ready: function() {
      // TODO, consistent naming
      this.$on("items-found", function(items, models) {
        this.$set("items", items);
        this.$set("models", models);
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

        }
      },
      checkedBoxes: {
        cache: false,
        get: function() {
          return 1;
        }
      }
    },

    methods: {

      // Reset all input fields.
      resetFields: function() {
        // Empty all fields:
        $(".search-details input[type='text'], .search-details input[type=date]").val("");

        // Todo, reset sliders to min/max
        var sliders = $(".ion-range");

        // Deselect all bootstrap select pickers
        $(".search-details .select-picker").selectpicker("deselectAll");

        $.each(sliders, function(key, slider) {
          var irs = $(slider).data("ionRangeSlider");

          // Reset /from & to to min/max.
          irs.update({
            from: irs.options.min,
            to: irs.options.max
          });
        });

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
