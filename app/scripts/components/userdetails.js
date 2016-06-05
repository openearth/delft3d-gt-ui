/* global Vue */

var exports = (function () {
  "use strict";
  // Our user details component
  var UserDetails = Vue.component("user-details", {
    // not much in here.
    template: "#template-user-details",
    data: function() {
      return {
        user: {
          name: "Unknown user",
          company: "Unknown company"
        }
      };
    },

    ready: function() {
      $.getJSON("/api/v1/user/")
        .done((data) => {
          this.user = data;
        })
        .fail((e) => {
          console.log("failed to get user info", e);
        });
    },
    computed: {
      details: function() {
        var parts = [
          "name: " + _.get(this.user, "name"),
          "company: " + _.get(this.user, "company")
        ];

        return _.join(parts, "\n");
      }
    },
    methods: {
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
