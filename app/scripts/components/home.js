/* global Vue */

var exports = (function () {
  "use strict";
  // Our homepage component
  var HomeView = Vue.component("home-view", {
    // not much in here.
    template: "#template-home"
  });

  return {
    HomeView: HomeView
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
