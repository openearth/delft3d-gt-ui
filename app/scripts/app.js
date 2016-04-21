/* global UI, Models, Vue, ModelDetails,ComponentHome,ComponentModelList, ScenarioBuilder */
//import modelList from "templates/list-running-models.vue";
var vm;

(function() {
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

        var router = new VueRouter();

        router.map({
          "/models/:id": {
            component: ModelDetails
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

})();
