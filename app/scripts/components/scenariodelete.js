/* global Vue, router */

var exports = (function () {
  "use strict";
  // Our homepage component
  var DeleteScenario = Vue.component("delete-scenario", {
    // not much in here.
    template: "#template-delete-scenario",
    data: function() {
      return {

      };
    },
    route: {
      data: function(transition) {

        var newData = {
          scenarioid: parseInt(transition.to.params.scenarioid)
        };

        this.deleteScenario(newData.scenarioid);
        transition.next(newData);
      }
    },

    methods: {

      deleteScenario: function(scenarioid) {



        var postdata = {
          id: scenarioid,
          deletefiles: true
        };

        $.ajax({
          url: "/scenario/delete",
          data: postdata,
          method: "POST"
        }).done(function() {

          this.selectedScenarioId = -1;


          // Go back to home.
          var params = { };

          router.go({
            name: "home",
            params: params
          });


        });

      }
    }

  });

  return {
    DeleteScenario: DeleteScenario
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
