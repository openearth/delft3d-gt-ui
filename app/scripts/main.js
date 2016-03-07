/* global UI, Models, Vue */
//import modelList from 'templates/list-running-models.vue';

(function () {
  "use strict";

  
  // Move these files to an app class later.
  var models = new Models();

  // Main javascript code, initialize components, there shouldn"t be much here.
  //http://dl-ng004.xtr.deltares.nl/
  var config = {
    "BaseURL": "http://136.231.10.175:8888"
  };

  // Load templates first:
  $("#template-container").load( "templates/list-running-models.html", function()
  {


  // Vue.config.debug = true;


  

   var data = 
   {
      models:
      {
        gridColumns: ["run #", "Status", "Est. time left", ""],

        searchQuery: "",
        gridData: []
      },

      currentView: 'home',
      selectedModel: "none"
    };


// register the grid component
   Vue.component("model-list", {
      template: "#template-model-list",
     
      props: {
        data: Array,
        columns: Array,
        filterKey: String
      },

      computed:
      {
        data: 
        {
          cache: false,
          get: function () {
            return  data.models.gridData;
          }
        },

        // Returns true if we have no items in the grid array
        hasNoModels:
        {
          get: function() {
            return (data.models.gridData.length == 0);
          }
        }
      
      },

      data: function ()
      {
        this.columns = data.models.gridColumns;
        this.data = data.models.gridData;
      
        if (this.columns != undefined)
        {
          var sortOrders = {};
          console.log(this.columns);
          this.columns.forEach(function (key) {
          sortOrders[key] = 1;
          });
        }        

        return {
          sortKey: "",
          sortOrders: sortOrders
        };
      },

      methods: {
        sortBy: function (key) {
          this.sortKey = key;
          this.sortOrders[key] = this.sortOrders[key] * -1;
        },

        removeModel: function (rowindex) {

          // now we have access to the native event
          var uuid = this.data[rowindex].fields.uuid;
          models.deleteModel( {uuid: uuid}, function() { });
        },

        detailModel: function (rowindex) {
          // now we have access to the native event
          var uuid = this.data[rowindex].fields.uuid;
          data.selectedModel = uuid;
          data.currentView = "model-details";
        }

      }
    });

    // Our homepage component
    Vue.component('home', { 
     template: "#template-home",
     ready: function () {
      
      console.log("activate home");
      
      // Register event handlers:
      //setTimeout(function(){
      
      ui.registerHandlers();
      //}, 1000);

     },

     methods: {

      // Submit model:
      submitModel: function()
      {
          console.log("submit model");
          //var _ui = UI;

          ui.submitModel();
      }

     }
    });

    // The model details page.
    Vue.component('model-details', { 
      template: "#template-modeldetails",
      computed: {

        // Update whenever selectedModel changes.
        selectedModel: {
          cache: false,
          get: function () {
            return  data.selectedModel
          }
        }
      },

      methods: {
        closeDetails: function()
        {
          // Back to the main screen view
         data.currentView = "home";
        }

      }
     });


    models.setConfiguration(config);

    // Register some event handlers.
    var ui = new UI(models);



    // Get list of models:
    models.getModels($.proxy(ui.UpdateModelList, ui));

    // Enable auto refresh.
    models.toggleAutoUIRefresh($.proxy(ui.UpdateModelList, ui), 5000);


 
    var vm = new Vue({
      el: "#app",
      data: data
    });
    window.vuevm = vm;    

});





}());
