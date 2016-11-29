/* global Vue, store, getDialog */

var exports = (function () {
  "use strict";

  var ModelControlMenu = Vue.component("model-control-menu", {

    template: "#template-model-control-menu",

    data: function() {

      return {
        collapseShow: true,
        sharedState: store.state

      };

    },

    computed: {
      numSelectedModels: function () {
        return store.getSelectedModels().length;
      }
    },

    methods: {
      expandScenarios: function() {
        if (this.collapseShow) {
          $(".scenario-card .collapse").collapse("show");
        } else {
          $(".scenario-card .collapse").collapse("hide");
        }
        this.collapseShow = !this.collapseShow;
      },

      resetSelectedModels: function() {
        // Get a confirm dialog
        this.deleteDialog = getDialog(this, "confirm-dialog", "reset-runs");

        this.deleteDialog.onConfirm = () => {
          store.resetSelectedModels();

          this.deleteDialog.hide();
        };

        // We also show an extra warning in the dialog, if user chooses to remove additional files.
        this.deleteDialog.showAlert(false);

        // Show the dialog:
        this.deleteDialog.show();
      },

      startSelectedModels: function() {
        store.startSelectedModels();
      },

      stopSelectedModels: function() {
        // Get a confirm dialog
        this.deleteDialog = getDialog(this, "confirm-dialog", "stop-runs");

        this.deleteDialog.onConfirm = () => {
          store.stopSelectedModels();

          this.deleteDialog.hide();
        };

        // We also show an extra warning in the dialog, if user chooses to remove additional files.
        this.deleteDialog.showAlert(false);

        // Show the dialog:
        this.deleteDialog.show();
      },

      deleteSelectedModels: function() {
        // Get a confirm dialog
        this.deleteDialog = getDialog(this, "confirm-dialog", "delete-runs");

        this.deleteDialog.onConfirm = () => {
          store.deleteSelectedModels();

          this.deleteDialog.hide();

        };

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
