/* globals fetchModels, router */
var exports = (function () {
  "use strict";
  /* global Vue */

  // register the grid component
  var ModelList = Vue.component("model-list", {

    template: "#template-model-list",
    data: function() {
      return {
        models: []
      };
    },
    props: ["filter"],
    ready: function() {
      // TODO: this only works if the modellist is active. If you go directly to a model it does not work.
      // Fix fetchmodel (and the server) so it actually fetches 1 model.
      // fetch now
      fetchModels()
        .then((data) => {
          console.log("fetched models", data);
          this.models = data;
        });

      // and fetch on every 10 seconds
      setInterval(
        // create a callback for every second
        () => {
          // fetch the models
          fetchModels()
            .then((data) => {
              this.models = data;
            });
        },
        // every 10 seconds
        10000
      );

    },
    route: {
      data: function(transition) {
        fetchModels()
          .then(
            (json) => {
              // copy old data and set model
              var data = this.$data;

              data.models = json;
              // transition to this new data;
              transition.next(data);
            }
          );
      }


    },

    computed: {
      // Get the current selected modelid from the routing URL
      selectedModelId: {
        get: function() {

          var id = -1;

          // If we have a routing var, we use it:
          if (this.$route !== undefined && this.$route.params.modelid !== undefined) {

            id = parseInt(this.$route.params.modelid);
          }

          if (id === -1) {
            console.log("choose the first from selected models", this.selectedModels);
            var selectedModel = _.first(this.selectedModels);

            if (selectedModel) {
              id = selectedModel.id;
              // go to the new model
              this.selectModel(id);
            }
          }
          return id;

        }
      },
      selectedScenarioId: {
        get: function() {
          var id = -1;
          // check if we can get the parameter from the route
          if (_.has(this.$route, 'params.scenarioid')) {
            id = parseInt(this.$route.params.scenarioid);
          }
          return id;

        }
      },
      selectedModels: {
        get: function() {
          var result = this.models;

          if (this.filter === "scenarios") {
            // is this the best approach, couldn't get a filterkey to work (no access to routing info)
            var scenarioId = this.selectedScenarioId;

            result = _.filter(this.models, ["scenario.id", scenarioId]);
          }
          return result;
        }
      }
    },
    methods: {


      selectModel: function(id) {
        var params = {
          modelid: id,
          scenarioid: this.selectedScenarioId
        };

        if(params.modelid === -1) {
          console.log("no model yet selected");
        }

        console.log("using router", params);

        // TODO: keep routing logic in main window
        router.go({
          name: "finder-columns",
          params: params
        });
      }
    }
  });

  return {
    ModelList: ModelList
  };
}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
