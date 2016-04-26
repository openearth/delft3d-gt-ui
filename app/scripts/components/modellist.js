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
          return this.$route.params.modelid;

        }
      }
    },

    methods: {
      selectModel: function(id) {
        var params = {
          modelid: id,
          scenarioid: this.$route.params.scenarioid
        };

        console.log("using router", router, "to go to", params, this);
        router.go({
          name: "finder-columns",
          params: params
        });
      },
      selectedModels: function() {
        var result = this.models;

        if (this.filter === "scenarios") {
          // is this the best approach, couldn't get a filterkey to work (no access to routing info)
          var scenario = parseInt(this.$route.params.scenarioid);

          result = _.filter(this.models, ["scenario", scenario]);

        }
        return result;
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
