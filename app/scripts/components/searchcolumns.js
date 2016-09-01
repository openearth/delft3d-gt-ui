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
      this.$on('items-found', function(items) {
        console.log('found items', items);
        this.$set('items', items);
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
      activeItem: function() {
        return _.first(_.filter(this.items, ['active', true]));
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

      },


      // Get a child by name, such that we do not have a fixed index.

      // Update the collapsibles.
      updateCollapsibles: function() {

        var that = this;


        $(".scenario-runs").on("hide.bs.collapse", function() {

          that.openedScenarios.push($(this).data("scenarioid"));

          $(this).parent().find(".glyphicon-chevron-down:first-child").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");

          that.openedScenarios = _.uniq(that.openedScenarios);


        });

        $(".scenario-runs").on("show.bs.collapse", function() {

          $(this).parent().find(".glyphicon-chevron-right:first-child").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");

          that.openedScenarios = _.uniq(_.without(that.openedScenarios, $(this).data("scenarioid")));

        });

      }

    }
  });

  return {
    SearchColumns: SearchColumns
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
