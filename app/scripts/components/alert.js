/* global Vue */

var exports = (function () {
  "use strict";
  // Our alert message component
  var AlertMessage = Vue.component("alert-message", {
    // not much in here.
    template: "#template-alert-message",

    data: function() {
      return {
        // Default alert-type. Bootstrap types, so valid options are: success, info, warning, danger
        type: "info",

        // Default hidden:
        visible: false,

        // And no text by default:
        message: "",

        timeoutID: undefined
      };
    },

    events: {
      "show-alert": function (msg) {
        this.visible = true;

        this.message = msg.message;

        // Change type?
        if (msg.type !== undefined) {
          this.type = msg.type;
        }

        // Automatically hide this message in how many ms?
        if (msg.showTime !== undefined) {
          window.clearTimeout(this.timeoutID);

          this.timeoutID = setTimeout(() => {
            this.visible = false;
          }, msg.showTime);
        }
      }
    },

    methods: {
      "hide": function () {
        this.visible = false;
      }
    }

  });

  return {
    AlertMessage: AlertMessage
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
