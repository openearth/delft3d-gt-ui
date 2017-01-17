/* global Vue, store, getDialog */

var exports = (function () {
  "use strict";

  var ModelControlMenu = Vue.component("model-control-menu", {

    template: "#template-model-control-menu",

    data: function() {

      return {
        collapseShow: true,
        selectedDownloads: {
          "export_d3dinput": false,
          "export_images": false,
          "export_thirdparty": false,
          "export_movie": false
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

    /*eslint-disable camelcase*/

    watch: {
      "numSelectedModels": function () {
        if (this.numSelectedModels === 0) {
          this.selectedDownloads.export_d3dinput = false;
          this.selectedDownloads.export_images = false;
          this.selectedDownloads.export_thirdparty = false;
          this.selectedDownloads.export_movie = false;
        }
      },
      "selectedDownloads.exportThirdparty": function () {
        if (!this.someSelectedModelsAreFinished) {
          this.selectedDownloads.export_thirdparty = false;
        }
      },
      "someSelectedModelsAreFinished": function () {
        if (!this.someSelectedModelsAreFinished) {
          this.selectedDownloads.export_thirdparty = false;
        }
      }
    },

    /*eslint-enable camelcase*/

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
        this.deleteDialog.showAlert(false);

        // Show the dialog:
        this.deleteDialog.show();

      },

      shareSelectedModels: function (domain) {
        // Get a confirm dialog
        this.shareDialog = getDialog(this, "confirm-dialog", "share-runs");

        this.shareDialog.onConfirm = () => {
          store.shareSelectedModels(domain);

          this.shareDialog.hide();
        };
        this.shareDialog.showAlert(false);

        // Show the dialog:
        this.shareDialog.show();
      },

      downloadSelectedModels: function () {
        store.downloadSelectedModels(this.selectedDownloads);
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
