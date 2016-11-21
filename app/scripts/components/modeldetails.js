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
        sharedState: store.state
      };
    },
    computed: {
      activeModel: {
        cached: false,
        get: function () {
          return this.sharedState.activeModelContainer;
        }
      },
      isReadOnly: {
        cache: false,
        get: function () {
          return this.activeModel.data.shared !== "p";
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

          return niceStrings[this.activeModel.data.shared];
        }
      },
      delft3DVersion: {
        cache: false,
        get: function () {
          return this.activeModel.data.versions.delft3d.delft3d_version;
        }
      },
      reposUrl: {
        cache: false,
        get: function () {
          if (this.activeModel.data.versions.preprocess.REPOS_URL !== undefined) {
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
        // Open download window
        var id = this.activeModel.id;

        // Get array of checked download options.
        var downloadOptions = $(".downloadoption:checked").map(function() {
          return "options=" + $(this).val();
        }).get(); //

        window.open("/api/v1/scenes/" + id + "/export/?" + downloadOptions.join("&"));
      },
      downloadOptionsChange: function() {
        //Determine if there is any download option enabled, if not, disable button
        var selectedOptions = $(".downloadoption:checked").length;

        $("#download-submit").prop("disabled", selectedOptions === 0);
      },
      hasPostProcessData: function () {
        if(("data" in this.activeModel) && ("info" in this.activeModel.data) && "postprocess_output" in this.activeModel.data.info) {
          return (Object.keys(this.activeModel.data.info.postprocess_output).length > 0);
        }
        return false;
      },
      publishModel: function (level) {
        store.publishModel(this.activeModel, level);
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
      startModel: function () {
        store.startModel(this.activeModel);
      },
      stopModel: function () {
        store.stopModel(this.activeModel);
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
