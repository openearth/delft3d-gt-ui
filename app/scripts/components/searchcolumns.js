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
        RunCount: 0
      };
    },
    components: {
      "search-details": SearchDetails,
      "search-list": SearchList,
      "model-details": ModelDetails

    },


    methods: {

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
        var modelList = this.$refs.models;

        // Remove items which have double id's.
        // Otherwise we get multiple runs in the list which share the same scenario.
//        models = _.uniqBy(models, "id");

        modelList.filter = "search";

        modelList.models = models;

        this.ScenarioCount = numScenarios;
        this.RunCount = numRuns;

        var that = this;

        this.$nextTick(function() {


          // Test, for changing arrow when using collapse
          // We also manage the tracking of collapsed scenarios here.
          // This is not the best place for this - refactor later.

          $(".scenario-runs").on("show.bs.collapse", function() {
            var dataid = $(this).data("scenarioid");

            that.$refs.models.openedScenarios.push(dataid);

            $(this).parent().find(".glyphicon-chevron-right:first-child").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");

          });

          $(".scenario-runs").on("hide.bs.collapse", function() {

            var dataid = $(this).data("scenarioid");

            that.$refs.models.openedScenarios = _.uniq(_.without(that.$refs.models.openedScenarios, dataid));


            $(this).parent().find(".glyphicon-chevron-down:first-child").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
          });
        });

      },

      // User clicked on a result item:
      "models-selected": function(id) {
        var modelDetails = this.getChildByName("model-details"); //this.$children[2]; //

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
