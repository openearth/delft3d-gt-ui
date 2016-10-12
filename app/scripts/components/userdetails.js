/* global Vue */

var exports = (function () {
  "use strict";

  var UserDetails = Vue.component("user-details", {

    template: "#template-user-details",
    data: function() {
      return {
        sharedState: store.state
      };
    }
  });

  return {
    UserDetails: UserDetails
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
