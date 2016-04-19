/* global Vue, Clipboard */

var ModelDetails;

var exports = (function() {
  "use strict";

  // Constructor of our component
  ModelDetails = function(app, models) {
    // Store reference to our app
    this.app = app;
    this.models = models;
    this.selectedModelData = app.getTemplateData().selectedModel;

    var that = this;

    //var currentAnimationIndex;

    // The model details page.
    Vue.component("model-details", {
      template: "#template-model-details",
      data: function() {
        return {
          // Current animation frame:
          currentAnimationIndex: 0,

          // timer id for animation.
          timerAnimation: -1,

          // Which imagelist are we currently watching?
          currentAnimationKey: "",

          isAnimating: false
        };
      },
      beforeCompile: function() {

      },
      ready: function() {


        var clipboard = new Clipboard("#btn-copy-log-output");

        clipboard.on("success", function(e) {
          e.clearSelection();
        });

        /*
        clipboard.on("error", function(e) {
        });
        */

        //this.currentAnimationIndex = 0;
        //this.$data.currentAnimationIndex = 0;
        // Maybe use https://github.com/vuejs/vue-async-data later?

        var selectedData = that.app.getTemplateData().selectedModel; // that.selectedModelData; // that.app.getTemplateData();

        // We change this to: that.selectedModelData later. But now we cannot test this, so it's not very safe to make changes on guess work.

        if (selectedData !== null) {

          models.fetchLogFile(selectedData, function(logdata) {

            var templateData = that.app.getTemplateData();

            templateData.logoutput = logdata;


            return logdata;
          });
        }


      },

      computed: {

        // Update whenever selectedModel changes.
        logoutput: {
          cache: false,
          get: function() {
            return that.app.getTemplateData().logoutput;
          }
        },
        selModel: {
          cache: false,
          get: function() {
            var m = that.app.getTemplateData().selectedModel;

            return m;
          }
        },

        animationIndex: {
          cache: false,
          get: function() {
            return this.currentAnimationIndex;
          }
        },

        animationFrame: {
          cache: false,
          get: function() {
            var animationKey = this.currentAnimationKey;
            var selModel = that.app.getTemplateData().selectedModel;
            var imgs = selModel.processingtask.state_meta[animationKey];

            if (imgs !== undefined) {
              return selModel.fileurl + imgs.location + imgs.images[this.currentAnimationIndex];
            }

            return "";

          }
        },

        // Returns true if the model is running. We might have to depend on some other variables
        // But for now we say that "processing" means running.
        isModelRunning: {
          cache: false,
          get: function() {
            var selModel = that.app.getTemplateData().selectedModel;

            return selModel.state === "PROCESSING";
          }
        },

        isAnimating: {
          cache: false,
          get: function() {

            return this.timerAnimation > 0;
          }
        },

        hasFrames: {
          cache: false,
          get: function() {

            var animationKey = this.currentAnimationKey;
            var selModel = that.app.getTemplateData().selectedModel;
            var imgs = selModel.processingtask.state_meta[animationKey];

            if (imgs !== undefined) {
              return imgs.images.length > 0;
            }

            return 0;

            /*
            var animationKey = this.currentAnimationKey;
            var selModel = that.app.getTemplateData().selectedModel;
            var imgs = selModel.processingtask.state_meta[animationKey];

            return imgs.images.length > 0;
            */
          }
        }

      },

      methods: {
        closeDetails: function() {
          // Back to the main screen view
          that.app.getTemplateData().currentView = "home";
        },



        changeMenuItem: function(event) {

          var el = $(event.target);

          // Hide all panels except for the target.
          $(".collapse").hide();

          // Get target:
          var targetSelector = $(el).attr("data-target");
          var target = $(targetSelector);

          target.show();


          // If there is an animation property, we set this:
          var targetAnimation = $(el).attr("data-animation");

          if (targetAnimation !== undefined && targetAnimation.length > 0) {
            this.currentAnimationKey = targetAnimation;
            this.currentAnimationIndex = 0;
            this.stopImageFrame();

          } else {
            this.currentAnimationKey = "";
            this.currentAnimationIndex = 0;
          }



          event.stopPropagation();
        },

        // Remove item, based on incoming modelinfo.
        removeModel: function(modelinfo) {

          var id = modelinfo.id;
          var modelname = modelinfo.name;

          // This is here momentarily, it will be removed later. But this is needed to get closeDetails to work.
          var thisComponent = this;

          $("#dialog-remove-name").html(modelname);

          // Do we also remove all the additional files? This is based on the checkmark.
          // if deletefiles is true, we will tell the server that we want to remove these files.
          var deletefiles = $("#simulation-control-check-delete-files").is(":checked");


          var options = {
            "deletefiles": deletefiles
          };

          // User accepts deletion:
          $("#dialog-remove-response-accept").on("click", function() {

            that.models.deleteModel(id, options);

            // Hide dialog when user presses this accept.:
            $("#dialog-confirm-delete").modal("hide");

            // Go back home:
            thisComponent.closeDetails();

          });

          // We also show an extra warning in the dialog, if user chooses to remove additional files.
          $("#dialog-confirm-delete .msg-delete-extra").toggle(deletefiles);

          // Show the dialog:
          $("#dialog-confirm-delete").modal({});
        },

        // User wants to start a model. We just do not do anything now, as this needs to be implemented.
        startModel: function(modelinfo) {

          var id = modelinfo.id;

          // We use the runmodel for this.
          that.models.runModel(id);
        },

        // For animations:
        previousImageFrame: function() {
          // Check if an animation key has been set. If not, we bail out.
          if (this.currentAnimationKey.length === 0) {
            return;
          }

          this.currentAnimationIndex--;

          var imgs = that.app.getTemplateData().selectedModel.processingtask.state_meta[this.currentAnimationKey];

          // Probably wrap with active key.
          if (this.currentAnimationIndex < 0) {
            this.currentAnimationIndex = imgs.images.length - 1;
          }
        },

        stopImageFrame: function() {
          // Check if an animation key has been set. If not, we bail out.
          if (this.currentAnimationKey.length === 0) {
            return;
          }


          // Clear interval
          if (this.timerAnimation !== -1) {
            //  this.isAnimating =  false;
            clearInterval(this.timerAnimation);

            this.timerAnimation = -1;
          }

        },

        playImageFrame: function() {
          // Check if an animation key has been set. If not, we bail out.
          if (this.currentAnimationKey.length === 0) {
            return;
          }

          // Stop and start. (We do not want multiiple setintervals)
          this.stopImageFrame();
          this.timerAnimation = setInterval(this.nextImageFrame, 1000);

        },

        nextImageFrame: function() {
          // Check if an animation key has been set. If not, we bail out.
          if (this.currentAnimationKey.length === 0) {
            return;
          }

          this.currentAnimationIndex++;

          var imgs = that.app.getTemplateData().selectedModel.processingtask.state_meta[this.currentAnimationKey];

          if (imgs !== undefined) {
            // Probably wrap.
            if (this.currentAnimationIndex >= imgs.images.length) {
              this.currentAnimationIndex = 0;
            }
          }
        },

        downloadFiles: function() {

          var selectedData = that.app.getTemplateData().selectedModel;

          // Open download window
          var id = selectedData.id;

          window.open("/scene/export?id=" + id);
        },

        downloadOptionsChange: function() {

          //Determine if there is any download option enabled, if not, disable button
          var selectedOptions = $(".downloadoption:checked").length;

          $("#download-submit").prop("disabled", selectedOptions === 0);

        }

      }
    });

  };

  return {
    ModelDetails: ModelDetails
  };


}());


// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
}
