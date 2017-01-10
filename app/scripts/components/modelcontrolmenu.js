/* global Vue, store, getDialog */

var exports = (function () {
  "use strict";

  var ModelControlMenu = Vue.component("model-control-menu", {

    template: "#template-model-control-menu",

    data: function() {

      return {
        collapseShow: true,
        selectedDownloads: {
          "exportD3dinput": false,
          "exportImages": false,
          "exportMovie": false,
          "exportThirdparty": false
        },
        sharedState: store.state
      };

    },

    computed: {
      anyDownloadsSelected: function () {
        return Object.values(this.selectedDownloads).some(function(el) {
          return el;
        });
      },
      numSelectedModels: function () {
        return store.getSelectedModels().length;
      },
      someSelectedModelsAreFinished: function () {
        return Object.values(store.getSelectedModels()).some(function(model) {
          return model.data.state === "Finished";
        });
      }
    },

    watch: {
      "numSelectedModels": function () {
        if (this.numSelectedModels === 0) {
          this.selectedDownloads.exportD3dinput = false;
          this.selectedDownloads.exportImages = false;
          this.selectedDownloads.exportMovie = false;
          this.selectedDownloads.exportThirdparty = false;
        }
      },
      "selectedDownloads.exportThirdparty": function () {
        if (!this.someSelectedModelsAreFinished) {
          this.selectedDownloads.exportThirdparty = false;
        }
      },
      "someSelectedModelsAreFinished": function () {
        if (!this.someSelectedModelsAreFinished) {
          this.selectedDownloads.exportThirdparty = false;
        }
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

      },

      shareSelectedModels: function (domain) {
        console.log("Publish!", domain);
      },

      downloadSelectedModels: function () {
        console.log("Download!");
      },

      toggle: function(id, event) {
        event.stopPropagation();
        this.selectedDownloads[id] = !this.selectedDownloads[id];
      },
      preventCheck: function (event) {
        event.preventDefault();
        event.stopPropagation();
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
