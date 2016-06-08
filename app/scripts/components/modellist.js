/* globals fetchModels, router */
var exports = (function () {
  "use strict";
  /* global Vue */

  // register the grid component
  var ModelList = Vue.component("model-list", {

    template: "#template-model-list",

    props: ["filter"],

    data: function() {
      return {
        models: []
      };
    },

    ready: function() {
      // TODO: this only works if the modellist is active. If you go directly to a model it does not work.
      // Fix fetchmodel (and the server) so it actually fetches 1 model.
      // fetch now
      fetchModels()
        .then((data) => {
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
          var id = parseInt(this.$route.params.modelid);

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
          var id = parseInt(this.$route.params.scenarioid);

          return id;

        }
      },

      selectedModels: {
        get: function() {
          var result = this.models;

          if (this.filter === "scenarios") {
            // is this the best approach, couldn't get a filterkey to work (no access to routing info)
            var scenario = this.selectedScenarioId;
            result = _.filter(this.models, function(o) { return o.scenario_url.indexOf(scenario) > -1; });
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

        console.log("using router", router, "to go to", params, this);
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
