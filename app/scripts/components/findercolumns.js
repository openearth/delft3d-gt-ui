/* global Vue */

var exports = (function () {
  "use strict";
  // Our homepage component
  var FinderColumns = Vue.component("finder-columns", {
    // not much in here.
    template: "#template-finder-columns"
  });

  return {
    FinderColumns: FinderColumns
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
