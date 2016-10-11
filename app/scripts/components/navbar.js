/* global Vue */

var exports = (function () {
  "use strict";
  // Our alert message component
  var NavBar = Vue.component("navigation-bar", {

    template: "#template-navbar"

  });

  return {
    NavBar: NavBar
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
