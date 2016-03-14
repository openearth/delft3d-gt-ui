/* global Vue, Clipboard */

var ModelDetails;

var exports = (function () {
  "use strict";

  // Constructor of our component
  ModelDetails = function(app, models) {
    // Store reference to our app
    this.app = app;
    this.models = models;

    var that = this;

    // The model details page.
    Vue.component("model-details", {
      template: "#template-model-details",
      ready: function() {

        console.log("details");
        var clipboard = new Clipboard("#btn-copy-log-output");

        clipboard.on("success", function(e) {
          e.clearSelection();
        });

        /*
        clipboard.on("error", function(e) {
        });
        */

        // Maybe use https://github.com/vuejs/vue-async-data later?

        var selectedData = that.app.getTemplateData();

        if (selectedData != null)
        {
          models.fetchLogFile(selectedData.selectedModelID, function(logdata) {
            console.log("received logdata");
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
          get: function () {
            return that.app.getTemplateData().logoutput;
          }
        },
        selModel:
        {
          cache: false,
          get: function()
          {
            var m = that.app.getTemplateData().selectedModel;

            return m;
          }
        }

        /*
        selectedModel: {
          cache: false,
          get: function () {
            console.log("compute selectedmodel "  );
            // Try to find selected model and return live data:
            var selectedData = that.app.getTemplateData();

            if (selectedData.selectedModelID !== 0) {
              var modelinfo = that.models.findModelByID(selectedData.selectedModelID);

console.log(modelinfo.name);

              return modelinfo;

            }
            console.log("no data");

            return null;

          }
        }
    */

      },

      methods:
      {
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

          event.stopPropagation();
        },

        // Remove item, based on incoming modelinfo.
        removeModel: function (modelinfo) {

          var id = modelinfo.id; //$(this).data("uuid");
          var modelname = modelinfo.name;

          // This is here momentarily, it will be removed later. But this is needed to get closeDetails to work.
          var thisComponent = this;

          $("#dialog-remove-name").html(modelname);

          // User accepts deletion:
          $("#dialog-remove-response-accept").on("click", function() {

            that.models.deleteModel(id);

            // Hide dialog:
            // hide dialog.
            $("#dialog-confirm-delete").modal("hide");

            // Go back home:
            thisComponent.closeDetails();


          });
          // Show the dialog:
          $("#dialog-confirm-delete").modal({ });
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
