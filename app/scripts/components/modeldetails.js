/* global Vue, Clipboard */

var ModelDetails;

var exports = (function () {
  "use strict";

  // Constructor of our component
  ModelDetails = function(app, models)
  {
    // Store reference to our app
    this.app = app;
    this.models = models;

    var that = this;

    // The model details page.
    Vue.component("model-details", {
      template: "#template-model-details",
      ready: function()
      {

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

        models.fetchLogFile(selectedData.selectedModelUuid, function(logdata)
        {
          console.log("received logdata");
          var templateData = that.app.getTemplateData();

          templateData.logoutput = logdata;


          return logdata;
        });

        // for modifying the navigation interaction if desired.
        /*
        $(".active").on("hide.bs.dropdown", function(e) {
          //  e.preventDefault();
          //  return false;
        });
        */

      },

      computed: {

        // Update whenever selectedModel changes.
        logoutput: {
          cache: false,
          get: function ()
          {
            return that.app.getTemplateData().logoutput;
          }
        },
        selectedModel: {
          cache: true,
          get: function ()
          {
            console.log("compute selectedmodel");
            // Try to find selected model and return live data:
            var selectedData = that.app.getTemplateData();

            if (selectedData.selectedModelUuid !== 0)
            {
              var modelinfo = that.models.findModelByUUID(selectedData.selectedModelUuid);

              return modelinfo;

            }
            console.log("no data");

            return null;

          }
        }


      },

      methods:
      {
        closeDetails: function()
        {
          // Back to the main screen view
          that.app.getTemplateData().currentView = "home";
        },



        changeMenuItem: function(event)
        {

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
        removeModel: function (modelinfo)
        {

          // Store ref to component
          var thisComponent = this;

          var uuid = modelinfo.fields.uuid; //$(this).data("uuid");
          var modelname = modelinfo.fields.name;

          $("#dialog-remove-name").html(modelname);

          // User accepts deletion:
          $("#dialog-remove-response-accept").on("click", function()
          {

            that.models.deleteModel({uuid: uuid}, function() { });

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
