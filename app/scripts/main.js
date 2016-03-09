/* global App */

var exports = (function () {
  "use strict";

  /*eslint-disable no-unused-vars*/

  var app = new App();

  /*eslint-enable no-unused-vars*/
  app.loadMainTemplate();


}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
}

