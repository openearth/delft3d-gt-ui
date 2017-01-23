/* global ImageAnimation, ConfirmDialog, UserDetails, store, getDialog  */
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
        selectedDownloads: {
          "export_d3dinput": false,
          "export_images": false,
          "export_movie": false,
          "export_thirdparty": false
        }
      };
    },
    computed: {
      activeModel: {
        cached: false,
        get: function () {
          return this.sharedState.activeModelContainer;
        }
      },
      anyDownloadsSelected: {
        cache: false,
        get: function () {
          return Object.values(this.selectedDownloads).some(function(el) {
            return el;
          });
        }
      },
      dateCreatedText: {
        cached: false,
        get: function () {
          var d = new Date(_.get(this.activeModel, "data.date_created"), "");

          return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
        }
      },
      isReadOnly: {
        cache: false,
        get: function () {
          return _.get(this.activeModel, "data.shared", "p") !== "p";
        }
      },
      isIdle: {
        cache: false,
        get: function () {
          return _.get(this.activeModel, "data.state", "") === "Idle: waiting for user input";
        }
      },
      isRunning: {
        cache: false,
        get: function () {
          return _.get(this.activeModel, "data.state", "") === "Running simulation";
        }
      },
      isFinished: {
        cache: false,
        get: function () {
          return _.get(this.activeModel, "data.state", "") === "Finished";
        }
      },
      isQueued: {
        cache: false,
        get: function () {
          return _.get(this.activeModel, "data.state", "") === "Queued";
        }
      },
      shareLevelText: {
        cache: false,
        get: function () {
          var niceStrings = {
            "p": "private",
            "c": "company",
            "w": "world",
            "u": "updating"
          };

          return niceStrings[_.get(this.activeModel, "data.shared", "p")];
        }
      },
      delft3DVersion: {
        cache: false,
        get: function () {
          return _.get(this.activeModel, "data.versions.delft3d.delft3d_version", "");
        }
      },
      reposUrl: {
        cache: false,
        get: function () {
          if (_.has(this.activeModel, "data.versions.preprocess")) {
            return this.activeModel.data.versions.preprocess.REPOS_URL + "?p=" + this.activeModel.data.versions.preprocess.SVN_REV;
          }
          return "";
        }
      }
    },
    methods: {
      collapseToggle: function (e) {
        e.stopPropagation();
        $(e.target).closest(".panel").children(".collapse").collapse("toggle");
      },
      downloadFiles: function () {
        if(!this.anyDownloadsSelected) {
          return;
        }

        var id = this.activeModel.id;
        var downloadOptions = [];

        for(var option in this.selectedDownloads) {
          if (this.selectedDownloads[option] === true) {
            downloadOptions.push("options=" + option);
          }
        }

        window.open("/api/v1/scenes/" + id + "/export/?format=json&" + downloadOptions.join("&"));
      },
      hasPostProcessData: function () {
        if(("data" in this.activeModel) && ("info" in this.activeModel.data) && "postprocess_output" in this.activeModel.data.info) {
          return (Object.keys(this.activeModel.data.info.postprocess_output).length > 0);
        }
        return false;
      },
      publishModel: function (level) {
        // Get a confirm dialog
        this.deleteDialog = getDialog(this, "confirm-dialog", "publish");

        this.deleteDialog.onConfirm = function() {
          store.publishModel(this.activeModel, level);
          this.deleteDialog.hide();
        }.bind(this);

        // We also show an extra warning in the dialog, if user chooses to remove additional files.
        this.deleteDialog.showAlert(false);

        // Show the dialog:
        this.deleteDialog.show();
      },
      removeModel: function () {
        // Get a confirm dialog
        this.deleteDialog = getDialog(this, "confirm-dialog", "delete");

        this.deleteDialog.onConfirm = function() {
          store.deleteModel(this.activeModel);
          this.deleteDialog.hide();
        }.bind(this);

        // We also show an extra warning in the dialog, if user chooses to remove additional files.
        this.deleteDialog.showAlert(false);

        // Show the dialog:
        this.deleteDialog.show();
      },
      resetModel: function () {
        // Get a confirm dialog
        this.resetDialog = getDialog(this, "confirm-dialog", "reset");

        this.resetDialog.onConfirm = function() {
          store.resetModel(this.activeModel);
          this.resetDialog.hide();
        }.bind(this);

        // We also show an extra warning in the dialog, if user chooses to remove additional files.
        this.resetDialog.showAlert(false);

        // Show the dialog:
        this.resetDialog.show();
      },
      startModel: function () {
        store.startModel(this.activeModel);
      },
      stopModel: function () {
        store.stopModel(this.activeModel);
      },
      toggle: function(id, doFlag) {
        if (doFlag) {
          this.selectedDownloads[id] = !this.selectedDownloads[id];
        }
      }
    }
  });

  return {
    ModelDetails: ModelDetails
  };

}());


// If we"re in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
