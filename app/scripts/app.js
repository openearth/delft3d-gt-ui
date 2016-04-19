/* global UI, Models, Vue, ModelDetails,ComponentHome,ComponentModelList*/
//import modelList from "templates/list-running-models.vue";

(function() {
  "use strict";

  var vm;

  $(document).ready(function() {
    console.log("document loaded");
    // We load the file in the template container;
    $("#template-container").load(
      "templates/templates.html",
      function() {

        console.log("templates loaded, starting vue application");
        vm = new Vue({
          el: "#app",
          data: function() {
            return {
              currentView: "home-view",
              selectedModel: null
            };
          }
        });
      }
    );

  })

})();
