/* global ImageAnimation, ConfirmDialog, UserDetails, Viewer3DComponent, store, getDialog  */
var exports = (function () {
  "use strict";

  var ModelDetails = Vue.component("model-details", {
    template: "#template-model-details",
    components: {
      // <my-component> will only be available in Parent's template
      "image-animation": ImageAnimation,
      "confirm-dialog": ConfirmDialog,
      "user-details": UserDetails,
      "viewer-3d": Viewer3DComponent
    },
    data: function() {
      return {
        sharedState: store.state,
        selectedDownloads: {
          "export_d3dinput": false,
          "export_images": false,
          "export_movie": false,
          "export_thirdparty": false
        },
        viewerActive: false,
        model: "GTSM",
        updates: ['dit', 'is', 'een', 'test'],
        selectedUpdate: ""
      };
    },
    computed: {
      activeModel: {
        cached: false,
        get: function () {
          var model = this.sharedState.activeModelContainer;

          // model details are conditionally rendered: activating jQuery tooltips when there is a model
          this.$nextTick(this.activateTooltips);
          return model;
        }
      },
      anyDownloadsSelected: {
        cache: false,
        get: function () {
          return _.values(this.selectedDownloads).some(function(el) {
            return el;
          });
        }
      },
      dateCreatedText: {
        cached: false,
        get: function () {
          var d = new Date(_.get(this.activeModel, "data.date_created", ""));

          if (isNaN(d.getTime())) {  // something went wront here
            return "";  // elegant fail
          }

          return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
        }
      },
      isReadOnly: {
        cache: false,
        get: function () {
          return _.get(this.activeModel, "data.shared", "p") !== "p";
        }
      },
      entrypoints: {
        cache: false,
        get: function () {
          console.log('entrypoints', _.get(this.activeModel, "data.entrypoints", ""))
          return _.get(this.activeModel, "data.entrypoints", "")
        }
      }
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
            "": "-",
            "p": "private",
            "c": "company",
            "w": "world",
            "u": "updating"
          };

          return niceStrings[_.get(this.activeModel, "data.shared", "")];
        }
      },
      outdated: {
        cache: false,
        get: function () {
          return _.get(this.activeModel, "data.outdated", false);
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
    watch: {
      isFinished: {
        deep: false,
        handler: function () {
          if (!this.isFinished) {
            /* eslint-disable camelcase */
            this.selectedDownloads.export_thirdparty = false;
            /* eslint-enable camelcase */
          }
        }
      },
      isIdle: {
        deep: false,
        handler: function (newIsIdleValue) {
          if(newIsIdleValue) {
            $("#simulation-controls-collapse").collapse("show");
          }
        }
      }
    },
    methods: {
      collapseToggle: function (viewerFlag, e) {
        if (viewerFlag) {
          this.viewerActive = !this.viewerActive;
        }
        $(e.target).closest(".panel").children(".collapse").collapse("toggle");
      },
      getActiveModelData: function (str) {
        return _.get(this.activeModel, "data." + str, "");
      },
      getActiveModelPPData: function () {
        let rv = {
          "DeltaTopD50": {"name": "D50 for Delta Top", "unit": "mm", "value": undefined},
          "DeltaTopsand_fraction": {"name": "Sand Fraction for Delta Top", "unit": "%", "value": undefined},
          "DeltaTopsorting": {"name": "Sorting for Delta Top", "unit": "-", "value": undefined},
          "DeltaFrontD50": {"name": "D50 for Delta Front", "unit": "mm", "value": undefined},
          "DeltaFrontsand_fraction": {"name": "Sand Fraction for Delta Front", "unit": "%", "value": undefined},
          "DeltaFrontsorting": {"name": "Sorting for Delta Front", "unit": "-", "value": undefined},
          "ProDeltaD50": {"name": "D50 for Prodelta", "unit": "mm", "value": undefined},
          "ProDeltasand_fraction": {"name": "Sand Fraction for Prodelta", "unit": "%", "value": undefined},
          "ProDeltasorting": {"name": "Sorting for Prodelta", "unit": "-", "value": undefined}
        };
        let ppJson = _.get(this.activeModel, "data.info.postprocess_output");

        _.each(_.keys(rv), (key) => {

          if (_.endsWith(key, "_fraction")) {
            rv[key].value = parseFloat(ppJson[key]) * 100;  // fractions are in percentages
          } else {
            rv[key].value = ppJson[key];
          }

        });

        return rv;
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
        return (Object.keys(_.get(this.activeModel, "data.info.postprocess_output", {})).length > 0);
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
      redoModel: function (entrypoints) {
        store.redoModel(this.activeModel, entrypoints);

        // // Get a confirm dialog
        // this.resetDialog = getDialog(this, "confirm-dialog", "redo");
        //
        // this.resetDialog.onConfirm = function() {
        //   store.redoModel(this.activeModel, update);
        //   this.resetDialog.hide();
        // }.bind(this);
        //
        // // We also show an extra warning in the dialog, if user chooses to remove additional files.
        // this.resetDialog.showAlert(false);
        //
        // // Show the dialog:
        // this.resetDialog.show();
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
      },
      doNothing: function () {
        return false;
      },
      activateTooltips: function () {
        if($("[data-toggle='tooltip']").tooltip) {
          $("[data-toggle='tooltip']").tooltip();
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
