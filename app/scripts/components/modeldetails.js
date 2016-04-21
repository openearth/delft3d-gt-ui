var ModelCreate;
var ModelDetails;

(function () {
  "use strict";
  /* global Vue, Clipboard */

  ModelCreate = Vue.component("model-create", {
    template: "#template-model-create",
    // Show the details of one model
    // Doesn't have a model yet....
    data: function() {
      return {
        model: {
          name: "",
          id: 0,
          params: {

          },
          results: [],
          state: "PENDING",
          log: ""

        }
      };
    },
    methods: {
      submit: function() {
        console.log("validating", this.$data);
        console.log("submitting", JSON.stringify(this.$data));
      }
    }

  });





  ModelDetails = Vue.component("model-details", {
    template: "#template-model-details",
    // Show the details of one model
    data: function() {
      var id = this.$route.params.id;
      return {
        // model id
        id: id,
        // Current animation frame:
        currentAnimationIndex: 0,

        // timer id for animation.
        timerAnimation: -1,

        // Which imagelist are we currently watching?
        currentAnimationKey: "",

        isAnimating: false
      };

    },
    ready: function(){
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

        }
      }
    },
    activate: function() {
      console.log("activating details view");

    },

    route: {
      data: function(transition) {
        // get model (from a service or parent)

        fetchModel(transition.to.params.id)
          .then(
            (json) => {
              // copy old data and set model
              var data = this.$data;
              data.model = json;
              // transition to this new data;
              transition.next(data);
              // and fetch log afterwards
              fetchLog(data.model.id)
                .then(log => {
                  $('#model-log-output').text(log);
                });
            }
          );
      }
    },
    methods: {
      downloadFiles: function() {
        // Open download window
        var id = this.data.model.id;

        window.open("/scene/export?id=" + id);
      },
      fetchLog: function() {
        // Working dir is at: modeldata.fileurl + delf3d + delft3d.log
        fetchLog(this.model.id)
          .then(log => {
            // don't do this with jquery, too slow
            document.getElementById('model-log-output').textContent = log;
          })
          .catch(e => {
            $('#model-log-output').text('No log available');
          });
      },
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

      downloadOptionsChange: function() {

        //Determine if there is any download option enabled, if not, disable button
        var selectedOptions = $(".downloadoption:checked").length;

        $("#download-submit").prop("disabled", selectedOptions === 0);
      }
    }
  });
}());
