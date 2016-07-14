var exports = (function () {
  "use strict";
  /* global Vue */

  // register the grid component
  var SearchList = Vue.component("search-list", {

    template: "#template-search-list",
    props: {

      "models": {
        type: Array,
        required: true
      },

      "selectedRuns": {
        type: Array,
        required: true
      },

      "openedScenarios": {
        type: Array,
        required: true
      }
    },

    data: function() {
      return {
        selectedResultId: -1,

        keyControlPressed: false

      };
    },
    ready: function() {

      var that = this;

      /// Register changes to the control & command key:
      $(document).on("keyup keydown", function (e) {
        that.keyControlPressed = e.ctrlKey | e.metaKey;
      });


      this.updateModels();


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

          return r;

          // if (this.filter === "scenarios") {
          //   // is this the best approach, couldn't get a filterkey to work (no access to routing info)
          //   var scenario = this.selectedScenarioId;

          //   result = _.filter(this.models, ["scenario", scenario]);

          // }
          // return result;
        }
      }



    },

    methods: {


      collapseScenario: function() {

      },

     // Update the scenario/run list.
      updateModels: function() {

        // fetch the models
        /*
		fetchModels()
          .then((data) => {
            this.models = data;
          });
		  */
        //this.$dispatch("models-selected", id);
      },


      // A new run is selected from the UI (new search result system)
      runSelected: function(id, ev) {

        // Note: this function contains a few things for the detail view to work, until this is updated to the new system.

        // Toggle selected id.
        var rundiv = $(ev.target).closest(".run");
        var checkbox = rundiv.find(".checkbox-run-selected");
        var checkboxState = null;

        // Is control down? Then we select multiple:
        if (this.keyControlPressed === true) {


          checkbox.prop("checked", !checkbox.prop("checked"));
          checkboxState = checkbox.prop("checked");

          rundiv.toggleClass("selected", checkboxState);


          // Determine which models have been selected (can be multiple, now we accept one)
          // Set selected result id:  (for old detail display at the moment)
          this.selectedResultId = id;

          // Directly select the id in the details list. (no routing)
          this.$dispatch("models-selected", id);

          // Add item to selected array, or remove:
          if (checkboxState === true) {
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

          // Control is not pressed, so we deselect all checkboxes, and only set the one we selected.
          $("checkbox-run-selected").removeAttr("checked");

          // Set new state
          checkboxState = checkbox.prop("checked");

          rundiv.toggleClass("selected", checkboxState);

          // Select it:
          // Set selected result id: (for old detail display at the moment)
          this.selectedResultId = id;

          // Directly select the id in the details list. (no routing)
          this.$dispatch("models-selected", id);

          // Only select this run:
          this.selectedRuns = [id];
        }

      },

      // Directly select one item in the result list. This happens from the UI (event)
      directSelect: function(id) {

        // Set selected result id:
        this.selectedResultId = id;

        // Directly select the id in the details list. (no routing)
        this.$dispatch("models-selected", id);
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
  // make global
  _.assign(window, exports);
}
