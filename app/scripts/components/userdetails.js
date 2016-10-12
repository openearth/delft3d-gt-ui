/* global Vue, store */

var exports = (function () {
  "use strict";

  var UserDetails = Vue.component("user-details", {

    template: "#template-user-details",
    data: function() {
      return {
      };
    },
    computed: {
      user: {
        cache: false,
        get: function() {
          return store.state.user;
        }
      }
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
