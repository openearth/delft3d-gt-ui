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
      this.$on('models-loaded', function(models) {
        console.log('models loaded', models);
      });
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

        // Is control down? Then we select multiple:
        /*
        ** We do not support the control key at the moment
        ** But please leave this code here, it needs to be activated next sprint.

        if (this.keyControlPressed === true) {

          rundiv.toggleClass("selected");

          // Determine which models have been selected (can be multiple, now we accept one)
          // Set selected result id:  (for old detail display at the moment)
          this.selectedResultId = id;

          // Directly select the id in the details list. (no routing)
          this.$dispatch("modelsSelected", id);

          // Add item to selected array, or remove:
          if (rundiv.hasClass("selected") === true) {
            // Did we already have the item? If not, add it.
            if (_.findIndex(this.selectedRuns, id) === -1) {
              // Add item to list of selected runs:
              this.selectedRuns.push(id);

            }

          } else {
            // Item has been removed... delete it?
            this.selectedRuns = _.without(this.selectedRuns, id);
          }

          // Make sure list is always unique:
          this.selectedRuns = _.uniq(this.selectedRuns);


        } else {
        */
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
