/* global UI, Models, Vue, ModelDetails,ComponentHome,ComponentModelList*/
//import modelList from "templates/list-running-models.vue";
var vm;

(function() {
  "use strict";

  $(document).ready(function() {
    console.log("document loaded");
    // We load the file in the template container;
    $("#template-container").load(
      "templates/templates.html",
      function() {

        console.log("templates loaded, starting vue application");

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

        // TODO: move to ModelDetails component
        $("#model-details-navigation .nav a").click(function (e) {
          e.preventDefault();
          $(this).tab("show");
        });

      }
    );



  });

})();
