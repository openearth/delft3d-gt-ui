/* global Vue, store */

var exports = (function () {
  "use strict";

  var ModelControlMenu = Vue.component("model-control-menu", {

    template: "#template-model-control-menu",

    data: function() {

      return {

        sharedState: store.state

      };

    },

    computed: {
      numSelectedModels: function () {
        return store.getSelectedModels().length;
      }
    },

    methods: {

      startSelectedModels: function() {
        store.startSelectedModels();
      },

      stopSelectedModels: function() {
        store.stopSelectedModels();
      },

      deleteSelectedModels: function() {
        store.deleteSelectedModels();
      }
    }

  });


  return {
    ModelControlMenu: ModelControlMenu
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
