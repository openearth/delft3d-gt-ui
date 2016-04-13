/* global Vue */

var ComponentHome;

var exports = (function () {
  "use strict";

  // Constructor of our component
  ComponentHome = function(app) {
    // Store reference to our app
    this.app = app;

    var that = this;

    // Our homepage component
    Vue.component("home", {
      template: "#template-home",
      ready: function () {

        // Register event handlers:
        that.app.getUI().registerHandlers();
      },

      computed: {

        // Update whenever selectedModel changes.
        test: {
          cache: false,
          get: function () {
            return that.app.getTemplateData().selectedModel.name;
          }
        }
      },

      methods: {
        // Submit model:
        submitModel: function() {

          that.app.getUI().submitModel();
        }
      }
    });
  };

  return {
    ComponentHome: ComponentHome
  };


}());


// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
}
