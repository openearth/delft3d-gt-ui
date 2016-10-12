/* global ImageAnimation, ConfirmDialog, UserDetails, getDialog, fetchModel, fetchLog, deleteModel, startModel, exportModel, stopModel, publishModel  */
var exports = (function () {
  "use strict";

  var ModelDetails = Vue.component("model-details", {
    template: "#template-model-details",
    components: {
      // <my-component> will only be available in Parent's template
      "image-animation": ImageAnimation,
      "confirm-dialog": ConfirmDialog,
      "user-details": UserDetails
    },
    data: function() {
      return {
        sharedState: store.state,
      };
    },
    computed: {
      activeModel: {
        cached: false,
        get: function () {
          return this.sharedState.activeModelContainer;
        }
      },
      isReadOnly: {
        cache: false,
        get: function () {
          return this.activeModel.data.shared != 'p';
        }
      },
      shareLevelText: {
        cache: false,
        get: function () {
          var niceStrings = {
            "p": "private",
            "c": "company",
            "w": "world",
            "u": "updating..."
          };
          return niceStrings[this.activeModel.data.shared];
        }
      }
    },
    methods: {
      collapseToggle: function (e) {
        e.stopPropagation();
        $(e.target).closest(".panel").children(".collapse").collapse("toggle");
      },
      fetchLog: function () {},
      publishModel: function (level) {
        store.publishModel(this.activeModel, level);
      },
      removeModel: function () {
        store.deleteModel(this.activeModel);
      },
      startModel: function () {
        store.startModel(this.activeModel);
      },
      stopModel: function () {
        store.stopModel(this.activeModel);
      }
    }
  });

  return {
    ModelDetails: ModelDetails
  };

}());


// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
