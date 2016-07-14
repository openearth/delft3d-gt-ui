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
        ScenarioCount: 0,

        // How many runs are in these scenarios?
        RunCount: 0,

        models: [],

        openedScenarios: [],
        selectedRuns: []

      };
    },
    components: {
      "search-details": SearchDetails,
      "search-list": SearchList,
      "model-details": ModelDetails

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
      "models-found": function (models, numScenarios, numRuns) {
        //var modelList = this.$refs.models;

        // Remove items which have double id's.
        // Otherwise we get multiple runs in the list which share the same scenario.
//        models = _.uniqBy(models, "id");

        //modelList.filter = "search";

        this.models = models;

        this.ScenarioCount = numScenarios;
        this.RunCount = numRuns;

        var that = this;

        this.$nextTick(function() {


          // Test, for changing arrow when using collapse
          // We also manage the tracking of ios here.
          // This is not the best place for this - refactor later.

          $(".scenario-runs").on("show.bs.collapse", function() {
            var dataid = $(this).data("scenarioid");

            that.openedScenarios.push(dataid);

            $(this).parent().find(".glyphicon-chevron-right:first-child").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");

            that.openedScenarios = _.uniq(that.openedScenarios);
            console.log(that.openedScenarios);

          });

          $(".scenario-runs").on("hide.bs.collapse", function() {

            var dataid = $(this).data("scenarioid");

            that.openedScenarios = _.uniq(_.without(that.openedScenarios, dataid));


            $(this).parent().find(".glyphicon-chevron-down:first-child").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");

            that.openedScenarios = _.uniq(that.openedScenarios);

            console.log(that.openedScenarios);
          });
        });

      },

      // User clicked on a result item:
      "models-selected": function(id) {
        var modelDetails = this.getChildByName("model-details");

        modelDetails.id = id;

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
