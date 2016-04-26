/* global ModelDetails, ScenarioCreate, ModelList, HomeView, FinderColumns */

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
        var App = Vue.extend({});

        router = new VueRouter();

        router.map({
          "/scenarios/:scenarioid/models/:modelid": {
            name: "finder-columns",
            component: FinderColumns
          },
          "/models/:modelid": {
            component: ModelDetails
          },
          "/scenarios/create": {
            component: ScenarioCreate
          },
          "/models": {
            component: ModelList
          },
          "/": {
            component: HomeView
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
  console.log("module available", module);
  module.exports = exports;
} else {
  console.log("exporting", exports);
  // make global
  _.assign(window, exports);
}
