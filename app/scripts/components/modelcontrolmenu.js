/* global Vue, store, getDialog */

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

        // Get a confirm dialog
        this.deleteDialog = getDialog(this, "confirm-dialog", "delete-runs");

        this.deleteDialog.onConfirm = function() {
          store.deleteSelectedModels();

          this.deleteDialog.hide();

        }.bind(this);

        // We also show an extra warning in the dialog, if user chooses to remove additional files.
        this.deleteDialog.showAlert(false);

        // Show the dialog:
        this.deleteDialog.show();

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
