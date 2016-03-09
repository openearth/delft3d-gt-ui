/* global Vue */

var ComponentHome;

var exports = (function () {
  "use strict";

  // Constructor of our component
  ComponentHome = function(app)
  {
    // Store reference to our app
    this.app = app;

    var that = this;

    // Our homepage component
    Vue.component("home", {
      template: "#template-home",
      ready: function ()
      {

        console.log("activate home");

        // Register event handlers:
        that.app.getUI().registerHandlers();
      },

      methods:
      {
        // Submit model:
        submitModel: function()
        {
          console.log("submit model");
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


