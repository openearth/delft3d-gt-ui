/* global UI, Models, Vue, Clipboard */
//import modelList from "templates/list-running-models.vue";

(function () {
  "use strict";


  // Move these files to an app class later.
  var models = new Models();

  // Main javascript code, initialize components, there shouldn"t be much here.
  //http://dl-ng004.xtr.deltares.nl/
  var config = {
    "BaseURL": ""
  };



  models.setConfiguration(config);

  // Register some event handlers.
  var ui = new UI(models);

  // Load templates first:
  $("#template-container").load("templates/templates.html", function() {
    // Vue.config.debug = true;

    var data = {
      models: {
        gridColumns: ["run #", "Status", "Est. time left", ""],

        searchQuery: "",
        gridData: []

      },
      logoutput: "",
      currentView: "home",
      selectedModel: "none",
      selectedModelUuid: 0
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
            return data.models.gridData;
          }
        },

        columns:
        {
          cache: false,
          get: function () {
            return data.models.gridColumns;
          }
        },

        // Returns true if we have no items in the grid array
        hasNoModels:
        {
          get: function() {
            return (data.models.gridData.length === 0);
          }
        }

      },

      data: function ()
      {
        this.columns = data.models.gridColumns;
        this.data = data.models.gridData;

        if (this.columns !== undefined)
        {
          var sortOrders = {};

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



        detailModel: function (rowindex) {
          // now we have access to the native event
          var uuid = this.data[rowindex].fields.uuid;

          data.selectedModel = this.data[rowindex];

          //Test:
          data.selectedModelUuid = uuid;

          data.currentView = "model-details";
        }

      }
    });

  // Our homepage component
  Vue.component("home", {
    template: "#template-home",
    ready: function ()
    {

      console.log("activate home");

      // Register event handlers:
      ui.registerHandlers();
    },

    methods:
    {
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
  Vue.component("model-details", {
    template: "#template-model-details",
    ready: function()
    {

      console.log("details");
      var clipboard = new Clipboard("#btn-copy-log-output");

      clipboard.on("success", function(e) {
        e.clearSelection();
      });

      /*
      clipboard.on("error", function(e) {
      });
      */

      // Maybe use https://github.com/vuejs/vue-async-data later?
      models.fetchLogFile(data.selectedModelUuid, function(logdata)
      {
        console.log("received logdata");
        window.vuevm.$data.logoutput = logdata;

        //window.vuevm.$set('logoutput',logdata);
        return logdata;
      });

      // for modifying the navigation interaction if desired.
      /*
      $(".active").on("hide.bs.dropdown", function(e) {
        //  e.preventDefault();
        //  return false;
      });
      */

    },

    computed: {

      // Update whenever selectedModel changes.
      logoutput: {
        cache: false,
        get: function ()
        {
          return window.vuevm.$data.logoutput;
        }
      },
      selectedModel: {
        cache: false,
        get: function ()
        {
          console.log("compute selectedmodel");
          // Try to find selected model and return live data:
          var selectedData = window.vuevm.$data;

          if (selectedData.selectedModelUuid !== 0)
          {
            //debugger;

            for (var i = 0; i < selectedData.models.gridData.length; i++)
            {
              if (selectedData.models.gridData[i].fields.uuid === selectedData.selectedModelUuid)
              {
                return selectedData.models.gridData[i];
              }
            }
          }

          return null;

        }
      }


    },

    methods:
    {
      closeDetails: function()
      {
        // Back to the main screen view
        data.currentView = "home";
      },



      changeMenuItem: function(event)
      {

        var el = $(event.target);

        // Hide all panels except for the target.
        $(".collapse").hide();

        // Get target:
        var targetSelector = $(el).attr("data-target");
        var target = $(targetSelector);

        target.show();

        event.stopPropagation();
      },

      // Remove item, based on incoming modelinfo.
      removeModel: function (modelinfo)
      {

        var that = this;
        var uuid = modelinfo.fields.uuid; //$(this).data("uuid");
        var modelname = modelinfo.fields.name;

        $("#dialog-remove-name").html(modelname);

        // User accepts deletion:
        $("#dialog-remove-response-accept").on("click", function()
        {

          models.deleteModel({uuid: uuid}, function() { });

          // Hide dialog:
          // hide dialog.
          $("#dialog-confirm-delete").modal("hide");

          // Go back home:
          that.closeDetails();


        });

        // Show the dialog:
        $("#dialog-confirm-delete").modal({ });
      }

    }
  });



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
