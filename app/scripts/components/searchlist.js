var exports = (function () {
  "use strict";
  /* global Vue */

  // register the grid component
  var SearchList = Vue.component("search-list", {

    template: "#template-search-list",
    props: {
      "filter": {
        type: String,
        required: true
      }
    },
    data: function() {
      return {
        selectedResultId: -1,
        models: [],
        filter: ""
      };
    },
    ready: function() {
      //TODO: this only works if the modellist is active. If you go directly to a model it does not work.
      //Fix fetchmodel (and the server) so it actually fetches 1 model.
      //fetch now
      this.updateModels();

      // and fetch on every 10 seconds
      // setInterval(
      //   // create a callback for every second
      //   () => {
      //     this.updateModels();
      //   },
      //   // every 10 seconds
      //   10000
      // );

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
          var result = this.models;

          if (this.filter === "scenarios") {
            // is this the best approach, couldn't get a filterkey to work (no access to routing info)
            var scenario = this.selectedScenarioId;

            result = _.filter(this.models, ["scenario", scenario]);

          }
          return result;
        }
      }
    },

    methods: {

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

        // Toggle selected id.
        console.log(ev.target);
        var rundiv = $(ev.target).closest(".run");
        var checkbox = rundiv.find(".checkbox-run-selected");

        checkbox.prop("checked", !checkbox.prop("checked"));
        var checkboxState = checkbox.prop("checked");

        rundiv.toggleClass("selected", checkboxState);


        // Determine which models have been selected (can be multiple, now we accept one)
        // Set selected result id:
        this.selectedResultId = id;

        // Directly select the id in the details list. (no routing)
        this.$dispatch("models-selected", id);

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
