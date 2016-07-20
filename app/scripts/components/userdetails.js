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
          /*eslint-disable camelcase*/
          first_name: "Unknown",
          last_name: "User"
          /*eslint-enable camelcase*/
        }
      };
    },

    ready: function() {
      this.fetchUserInfo();
    },
    computed: {
      details: function() {
        var parts = _.map(
          this.user,
          function(value, key) {
            return key + ": " + value;
          }
        );

        return _.join(parts, "\n");
      }
    },
    methods: {
      fetchUserInfo: function() {

        $.getJSON("/api/v1/users/me/")
        .done((data) => {
          this.user = _.first(data);
        })
        .fail((e) => {
          console.log("failed to get user info", e);
        });
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
