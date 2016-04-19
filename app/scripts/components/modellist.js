var ModelList;
(function () {
  "use strict";
  /* global Vue */

  // register the grid component
  ModelList = Vue.component("model-list", {
    template: "#template-model-list",

    data: function() {
      return {
        models: []
      };
    },

    methods: {
      // Remove item, based on incoming modelinfo.
      removeModel: function(id) {

        var model = _.pop(models, id);

        $("#dialog-remove-name").html(model.name);

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

        });

        // We also show an extra warning in the dialog, if user chooses to remove additional files.
        $("#dialog-confirm-delete .msg-delete-extra").toggle(deletefiles);

        // Show the dialog:
        $("#dialog-confirm-delete").modal({});
      }

    }
  });

}());
