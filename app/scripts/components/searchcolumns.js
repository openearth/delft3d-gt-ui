/* global Vue, SearchDetails, SearchList, ModelDetails */

var exports = (function () {
  "use strict";
  // Our homepage component
  var SearchColumns = Vue.component("search-columns", {
    // not much in here.
    template: "#template-search-columns",
    data: function() {
      return {

        // How many scenarios were found?
        numScenarios: 0,

        // How many runs are in these scenarios?
        numRuns: 0,

        models: [],

        openedScenarios: [],
        selectedRuns: [],
        selectedScenarios: []
      };
    },
    components: {
      "search-details": SearchDetails,
      "search-list": SearchList,
      "model-details": ModelDetails

    },


    computed: {

      selectedRunNames: {
        get: function() {

          // Loop through all selected runs and get the names of these.
          var names = [];
          var that = this;

          // We only have scenarios, not a seaprate models (runs) list.. could we improve this somehow?
          $.each(that.selectedRuns, function(key, value) {

            // Loop through all scenarios.
            that.models.forEach(function(scenario) {

              var item = _.find(scenario.scene_set, ["id", value]);

              if (item !== undefined) {
                names.push(item.name);
              }

            });
          });

          return names.join(",");
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

        // Enable all items in the select pickers chooser.
        var pickers = $(".select-picker");

        // This if statement is necessary for the testing library. Bit redundant, but it does not hurt to test anyway.
        if (pickers.selectpicker !== undefined) {
          pickers.selectpicker("refresh");
          pickers.selectpicker("selectAll");
        }

        // Domain selection boxes - enable all.
        $(".domain-selection-box input[type='checkbox']").prop("checked", "checked");

      },


      // Get a child by name, such that we do not have a fixed index.
      getChildByName: function(name) {
        var that = this;

        for(var i = 0; i < that.$children.length; i++) {

          // Check if name matches:
          if (that.$children[i].$options.name === name) {
            return that.$children[i];
          }
        }

        return null;
      }

    },
    events: {

      // Got some search results:
      // We receive the models, number of scenarios and number of runs.
      modelsFound: function (models, numScenarios, numRuns) {

        this.models = models;

        this.numScenarios = numScenarios;
        this.numRuns = numRuns;

        var that = this;

        this.$nextTick(function() {


          // Test, for changing arrow when using collapse
          // We also manage the tracking of ios here.
          // This is not the best place for this - refactor later.

          $(".scenario-runs").on("hide.bs.collapse", function() {
            var dataid = $(this).data("scenarioid");

            that.openedScenarios.push(dataid);

            $(this).parent().find(".glyphicon-chevron-down:first-child").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");

            that.openedScenarios = _.uniq(that.openedScenarios);


          });

          $(".scenario-runs").on("show.bs.collapse", function() {

            var dataid = $(this).data("scenarioid");

            $(this).parent().find(".glyphicon-chevron-right:first-child").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");

            that.openedScenarios = _.uniq(_.without(that.openedScenarios, dataid));

          });
        });

      },

      // User clicked on a result item:
      modelsSelected: function(id) {
        var modelDetails = this.getChildByName("model-details");

        if (modelDetails !== null) {
          modelDetails.id = id;
        }

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
