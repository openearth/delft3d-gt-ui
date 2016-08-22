/* global ModelDetails, ScenarioCreate, DeleteScenario, SearchColumns */

var router;

var exports = (function() {
  "use strict";

  // wait for page to load
  $(document).ready(function() {
    console.log("document loaded");

    // Main javascript code, initialize components, there shouldn"t be much here.

    // some debugging, for now
    Vue.config.debug = true;

    // We load the file in the template container;
    // wait for it.....
    $("#template-container").load(
      "templates/templates.html",
      function() {
        console.log("templates loaded, starting vue application");

        // Just an empty main application
        // (selected model is done using routing)
        var App = Vue.extend({
        });

        $.ajaxSetup({ cache: false });

        router = new VueRouter();

        router.map({
          "/models/:modelid": {
            component: ModelDetails
          },
          "/scenarios/create": {
            name: "scenarios-create",
            component: ScenarioCreate
          },
          "/": {
            name: "home",
            component: SearchColumns
          },
          "/scenarios/delete/:scenarioid": {
            name: "delete-scenario",
            component: DeleteScenario
          }

        });
        router.start(App, "#app");

      }
    );

  });

  // Export the router
  return {
    router: router
  };
})();

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {

  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
