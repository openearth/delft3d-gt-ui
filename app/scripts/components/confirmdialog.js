/* global Vue */

var exports = (function () {
  "use strict";

  var ConfirmDialog = Vue.component("confirm-dialog", {
    // not much in here.
    template: "#template-confirm-dialog",
    data: function() {
      return {
        onConfirm: null,
        onCancel: null
      };
    },
    props: {
      "dialogId": {
        type: String,
        required: true
      },
      "confirmButtonTitle": {
        type: String,
        required: true
      }
    },
    methods: {
      confirm: function() {
        if (this.onConfirm) {
          this.onConfirm();
        }
        this.hide();
      },

      cancel: function() {
        if (this.onCancel) {
          this.onCancel();
        }
        this.hide();
      },

      show: function() {
        console.log("id " + this.dialogId);
        var el = $("#" + this.dialogId + "-dialog");

        if (el.modal !== undefined) {
          el.modal({});
        }

      },

      hide: function() {

        var el = $("#" + this.dialogId + "-dialog");

        if (el.modal !== undefined) {
          el.modal("hide");
        }
      },

      showAlert: function(isVisible) {

        $("#" + this.dialogId + "-dialog-alert").toggle(isVisible);

      }
    }

  });

  var getDialog = function(element, component, dialogId) {
    for(var i = 0; i < element.$children.length; i++) {

      // Check if name matches:
      if (element.$children[i].$options.name === component) {
        var dialog = element.$children[i];

        if (dialog.dialogId === dialogId) {
          return element.$children[i];
        }
      }
    }

    return null;
  };

  return {
    ConfirmDialog: ConfirmDialog,
    getDialog: getDialog
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
