/* global ImageAnimation, ConfirmDialog, UserDetails, store  */
var exports = (function () {
  "use strict";

  var ModelDetails = Vue.component("model-details", {
    template: "#template-model-details",
    components: {
      // <my-component> will only be available in Parent"s template
      "image-animation": ImageAnimation,
      "confirm-dialog": ConfirmDialog,
      "user-details": UserDetails
    },
    data: function() {
      return {
      };
    },
    props: {
      model: {
        type: Object,
        required: false
      }
    },
    computed: {
      isReadOnly: {
        cache: false,
        get: function () {
          return this.model.shared !== "p";
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

          return niceStrings[this.model.shared];
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
        store.publishModel(this.model, level);
      },
      removeModel: function () {
        store.deleteModel(this.model);
      },
      startModel: function () {
        store.startModel(this.model);
      },
      stopModel: function () {
        store.stopModel(this.model);
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
