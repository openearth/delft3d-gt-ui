/* globals fetchModels */
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
    methods: {


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
