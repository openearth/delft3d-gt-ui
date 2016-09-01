var exports = (function () {
  "use strict";
  /* global Vue */

  // register the grid component
  var SearchList = Vue.component("search-list", {

    template: "#template-search-list",
    props: {

      // can contain scenarios and models
      "items": {
        type: Array,
        required: true
      }
    },

    data: function() {
      return {
      };
    },
    ready: function() {
      this.$on("models-loaded", function(models) {
        console.log("models loaded", models);
      });

    },
    watch: {
      items: function() {
        this.$nextTick(function() {
          $(".list-group").listgroup();
        });
      }

    },
    computed: {

      // Get the current selected modelid from the routing URL
      selectedModelId: {
        cache: false,
        get: function() {
          return this.selectedResultId;

        }
      },

      selectedModels: {

        get: function() {

          // Return new array of selectedRuns, remove the ones that do not exist anymore.
          //console.log
          // Get all runs from this.models.
          var allRuns = [];

          _.find(this.models, function(value) {

            // Is our id in this
            if (value.scene_set !== undefined) {
              for (var i = 0; i < value.scene_set.length; i++) {
                allRuns.push(value.scene_set[i].id);
              }
            }
          });

          // Now we remove items from the selectedRuns variable that do NOT exist in the allruns list
          // For example, these have been removed.
          var r = _.filter(this.selectedRuns, function(id) {
            return allRuns.indexOf(id) !== -1;
          });

          this.selectedRuns = r;

          if (r.length === 0) {
            this.$dispatch("modelsSelected", null);
          }

          return r;
        }
      }



    },

    methods: {
      clearActives: function() {
        // clear all active states
        var scenarios = _.filter(this.items, ["type", "scenario"]);
        // all models in scenarios
        var models = _.flatMap(scenarios, "models");

        _.each(models, (model) => {
          model.active = false;
        });
        // all items on first level (scenarios and orphans)
        _.each(this.items, (item) => {
          item.active = false;
        });
      },
      toggleActive: function(item) {
        var wasActive = item.active;

        this.clearActives();
        // was the item active
        item.active = !wasActive;
      },

      // User wants to select a scenario:
      scenarioSelect: function(id, ev) {
        var scenariodiv = $(ev.target).closest(".scenario");

        // We remove all "selected" classes from .scenario to unselect all, then we reselect the item we need.
        $(".scenario").removeClass("selected");

        scenariodiv.toggleClass("selected");

        var selected = $(".scenario.selected");
        var ids = [];

        selected.each(function(key, value) {
          ids.push($(value).data("scenarioid"));
        });

        this.selectedScenarios = ids;

        this.deselectAllRuns();
      },

      deselectAllRuns: function() {

        // Remove all selected:
        $(".run").removeClass("selected");

        // We deselect all runs.
        // Directly select the id in the details list. (no routing)
        this.$dispatch("modelsSelected", null);

        // Only select this run:
        this.selectedRuns = [];
      },

      // A new run is selected from the UI (new search result system)
      runSelected: function(id, ev) {

        // Note: this function contains a few things for the detail view to work, until this is updated to the new system.

        // Toggle selected id.
        var rundiv = $(ev.target).closest(".run");

        // Control is not pressed, so we deselect all checkboxes, and only set the one we selected.
        rundiv.toggleClass("selected");

        // Select it:
        // Set selected result id: (for old detail display at the moment)
        this.selectedResultId = id;

        // Directly select the id in the details list. (no routing)
        this.$dispatch("modelsSelected", id);

        // Only select this run:
        this.selectedRuns = [id];

        //}

      }
  }
});

  return {
    SearchList: SearchList
  };
}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  _.assign(window, exports);
}
