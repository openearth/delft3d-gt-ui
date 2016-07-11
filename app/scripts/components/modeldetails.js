/* global ImageAnimation, ConfirmDialog, getDialog, fetchModel, fetchLog, deleteModel, startModel, exportModel, stopModel, publishModel, router */
var exports = (function () {
  "use strict";

  var ModelDetails = Vue.component("model-details", {
    template: "#template-model-details",

    components: {
      // <my-component> will only be available in Parent's template
      "image-animation": ImageAnimation,
      "confirm-dialog": ConfirmDialog
    },

    // Show the details of one model
    data: function() {
      return {
        timerId: -1,
        model: {
        },
        publishLevels: [
          {
            "indicator": "p",
            "url": "private",
            "iconClass": "glyphicon-people",
            "description": "Private"
          },
          {
            "indicator": "c",
            "url": "company",
            "iconClass": "glyphicon-blackboard",
            "description": "Company"
          },
          {
            "indicator": "w",
            "url": "world",
            "iconClass": "glyphicon-globe",
            "description": "Public"
          }
        ],
        waitingForUpdate: false,
        publishDialog: null,
        deleteDialog: null,
        stopDialog: null
      };

    },

    created: function() {
      if (this.model.id !== -1) {
        this.updateData(this.model.id);
      }
    },
    ready: function() {
      // enable the tab based menu (only for tabs, keep real links)
      $("#model-details-navigation .nav a[data-toggle='tab']").click(function (e) {
        e.preventDefault();
        $(this).tab("show");
      });
      var clipboard = new Clipboard("#btn-copy-log-output");

      clipboard.on("success", function(e) {
        e.clearSelection();
      });

    },
    computed: {
      id: {
        get: function() {
          // default to -1
          var id = -1;

          try {
            // We always get the id from the route parameters. Update to props later.
            id = parseInt(this.$route.params.modelid);
          } catch (e) {
            console.log("can't get model id from route parameters, falling back to model -1", e);
          }
          return id;
        },
        set: function(val) {
          // updating the data
          // clear model data
          console.log("New model set, replacing model by empty model");
          var modelId = parseInt(val);

          this.model = {};

          this.updateData(modelId);

          // Regularly update the details.
          // Clear previous timers.
          if (this.timerId !== -1) {
            clearInterval(this.timerId);
            this.timerId = -1;
          }

          this.timerId = setInterval(() => {
            this.updateData(modelId);
          }, 5000);

        }


      },
      scenario: {
        get: function() {
          if (_.has(this, "model.scenario")) {
            // return the scenario from the model
            return this.model.scenario;
          } else {
            // model does not have a scenario;
            return -1;
          }
        }
      },

      // Get progress from data, in percentages.
      progress: {
        get: function() {

          if(this.model === undefined) {
            return 0;
          }

          var max = 0;

          if (this.model.info !== undefined) {
            $.each(this.model.info, function(key, value) {

              // Channel network images, etc are also inhere.. so we have to check if the info object exists..
              if (value.info !== undefined && value.info !== null) {
                // We loop through all output arrays, and take the highest progress.
                if (value.info.output !== undefined) {
                  for(var i = 0; i < value.info.output.length; i++) {
                    if (value.info.output[i].progress > max) {
                      max = value.info.output[i].progress;
                    }
                  }
                }
              }

            });
          }

          // Return in percent.
          return Math.round(max * 100);
        }

      },

      // Update whenever selectedModel changes.
      logoutput: {
        cache: false,
        get: function() {
          return this.model.logoutput;
        }
      },

      // Returns true if the model is running. We might have to depend on some other variables
      // But for now we say that "processing" means running.
      isModelRunning: {
        cache: false,
        get: function() {

          return this.model && this.model.state === "PROCESSING";
        }
      },

      publishLevel: {
        cache: false,
        get: function() {
          var msg = (this.waitingForUpdate ? "Changing to '" : "");

          var index = this.indexOfPublishLevel();

          if (this.waitingForUpdate) {
            index++;
          }

          if (index >= 0 && index <= this.publishLevels.length) {
            return msg + this.publishLevels[index].description + (this.waitingForUpdate ? "'" : "");
          }
          return "Unknown";
        }
      },

      nextPublishLevel: {
        cache: false,
        get: function() {
          var index = this.indexOfPublishLevel() + 1;

          if (index >= 0 && index < this.publishLevels.length) {
            return this.publishLevels[index].description;
          }
          return "Unknown";
        }
      }
    },
    route: {
      data: function(transition) {
        // get model (from a service or parent)

        this.updateData(parseInt(transition.to.params.modelid));
        transition.next();
      },
      activate: function(transition) {
        transition.next();

      }
    },
    methods: {
      updateData: function(id) {
        // update data with id, and if transition is passed transition to it
        // afterwards, pass the log

        // make sure id is a number
        fetchModel(id)
          .then(
            (json) => {

              // copy old data and set model
              var data = this.$data;

              data.model = json;

              if (this.waitingForUpdate) {
                this.highlightPublishLevel();
              }

              this.waitingForUpdate = false;
              // and fetch log afterwards
              // fetchLog(data.model.id)
              //   .then(log => {
              //     $("#model-log-output").text(log);
              //   })
              //   .catch(e => {
              //     $("#model-log-output").text("Failed to get log: " + e);
              //   });
            }
          )
          .catch(() => {
            //console.log("Failed to get model with id", id, "error", e);
          });

      },

      downloadFiles: function() {
        // Open download window
        var id = this.model.id;

        // Get array of checked download options.
        var downloadOptions = $(".downloadoption:checked").map(function() {
          return "options=" + $(this).val();
        }).get(); //

        window.open("/api/v1/scenes/" + id + "/export/?" + downloadOptions.join("&"));
      },
      // Remove item, based on incoming modelinfo.
      removeModel: function() {

        console.log("Removemodel");
        // keep track of the scenario before deletion
        var scenarioId = this.scenario;

        // Do we also remove all the additional files? This is based on the checkmark.
        // if deletefiles is true, we will tell the server that we want to remove these files.
        var deletefiles = true; // We do not provide this option anymore. LEaving it here shortly if someone changes his or her mind: $("#simulation-control-check-delete-files").is(":checked");


        var options = {
          "deletefiles": deletefiles
        };

        // This if statement caused thge delete to only work once:
        //if (!this.deleteDialog) {
        this.deleteDialog = getDialog(this, "confirm-dialog", "delete");
        //}

        this.deleteDialog.onConfirm = function() {
          var deletedId = this.model.id;

          deleteModel(deletedId, options)
            .then(() => {
              this.$parent.$broadcast("show-alert", {
                message: "Deleting run... It might take a moment before the view is updated.",
                showTime: 5000,
                type: "success"
              });

            })
            .catch(e => {
              console.log("model deletion failed", e);
            });

          // key values correspond to url parameters which are lowercase
          var params = {
            modelid: -1,
            scenarioid: scenarioId
          };

          // TODO: keep routing logic in main window
          router.go({
            name: "finder-columns",
            params: params
          });

        }.bind(this);

        // We also show an extra warning in the dialog, if user chooses to remove additional files.
        this.deleteDialog.showAlert(deletefiles);

        // Show the dialog:
        this.deleteDialog.show();


      },
      fetchLog: function() {
        // Working dir is at: modeldata.fileurl + delf3d + delft3d.log
        fetchLog(this.model.id)
          .then(log => {
            // don't do this with jquery, too slow
            document.getElementById("model-log-output").textContent = log;
          })
          .catch(e => {
            console.log(e);
            $("#model-log-output").text("No log available");
          });
      },

      // User wants to start a model. We just do not do anything now, as this needs to be implemented.
      startModel: function() {

        // We use the runmodel for this.
        startModel(this.model.id)
          .then(() => {
            this.$parent.$broadcast("show-alert", {
              message: "Restarting run... It might take a moment before the view is updated.",
              showTime: 5000,
              type: "success"
            });
          })
          .catch((e) => {
            console.log(e);
          });
      },

      exportModel: function() {
        exportModel(this.model.id)
          .then(msg => {
            console.log(msg);
          })
          .catch(e => {
            console.log(e);
          });
      },

      // Stop a model.
      stopModel: function() {
        var deletedId = this.model.id;

        if (!this.stopDialog) {
          this.stopDialog = getDialog(this, "confirm-dialog", "stop");
        }

        this.stopDialog.onConfirm = function() {
          stopModel(deletedId)
            .then(() => {
              this.$parent.$broadcast("show-alert", {
                message: "Stopping run... It might take a moment before the view is updated.",
                showTime: 5000,
                type: "success"
              });

            })
            .catch((e) => {
              console.log(e);
            });
        };

        this.stopDialog.show();
      },

      publishModel: function(index) {
        if (!this.publishDialog) {
          this.publishDialog = getDialog(this, "confirm-dialog", "publish");
        }

        this.publishDialog.onConfirm = function() {
          publishModel(this.model.id, this.publishLevels[index].url)
            .then(() => {
              this.$parent.$broadcast("show-alert", {
                message: "Changing publish level... It might take a moment before the view is updated.",
                showTime: 5000,
                type: "success"
              });
              this.waitingForUpdate = true;
              this.highlightPublishLevel();
            })
            .catch(e => {
              console.log(e);
            });
        }.bind(this);

        // Show the dialog
        this.publishDialog.show();
      },

      downloadOptionsChange: function() {

        //Determine if there is any download option enabled, if not, disable button
        var selectedOptions = $(".downloadoption:checked").length;

        $("#download-submit").prop("disabled", selectedOptions === 0);
      },

      isLevelEnabled: function(level) {
        return level > this.indexOfPublishLevel();
      },

      isReadOnly: function() {
        return !this.isLevelEnabled(1);
      },

      indexOfPublishLevel: function() {
        return _.map(this.publishLevels, function(level) {
          return level.indicator;
        }).indexOf(this.model.shared);
      },

      highlightPublishLevel: function() {
        $(".publish-level").addClass("highlighted");
        window.setTimeout(function() {
          $(".publish-level").removeClass("highlighted");
        }, 1500);
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
