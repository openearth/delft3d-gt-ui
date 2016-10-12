/* global Vue, SearchDetails, SearchList, ModelDetails, store */

var exports = (function () {
  "use strict";
  // Our homepage component
  var SearchColumns = Vue.component("search-columns", {
    // not much in here.
    template: "#template-search-columns",
    data: function() {
      var data = {
        // items that were found
        selection: {
          selectedModelIds: [],
          activeModel: null
        },
        models: store.state.models,
        scenarios: store.state.scenarios
      };
      return data;
    },
    components: {
      "search-details": SearchDetails,
      "search-list": SearchList,
      "model-details": ModelDetails
    },
    ready: function() {
      console.log("scenarios ready", this.scenarios);
      // make sure the state is merged with our scenarios and models

    },
    route: {
      data: function(transition) {
        transition.next();
        console.log("scenarios transition", this.scenarios);
      }
    },

    computed: {
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
