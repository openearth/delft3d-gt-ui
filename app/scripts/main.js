/* global App */

var exports = (function () {
  "use strict";

  var app = new App();

  app.loadMainTemplate();


}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
}
