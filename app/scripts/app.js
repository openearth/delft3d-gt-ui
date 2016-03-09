/* global UI, Models, Vue, ModelDetails,ComponentHome,ComponentModelList*/
//import modelList from "templates/list-running-models.vue";

var App;

var exports = (function () {
  "use strict";


  // Constructor of our UI class
  App = function()
  {


    // Main javascript code, initialize components, there shouldn"t be much here.
    //http://dl-ng004.xtr.deltares.nl/
    // http://136.231.10.175:8888
    this.config = {
      "BaseURL": ""
    };


    // Our shared template data:
    this.TemplateData = {
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

  };

  // We call this separate so our tests do not use JQuery.
  App.prototype.loadMainTemplate = function()
  {
    var that = this;
    
    // We load the template file and then start running the actual site.
    this.loadTemplate(function() 
    {

      // Move these files to an app class later.
      that.models = new Models(that, that.config);

      // Register some event handlers.
      that.ui = new UI(that, that.models);

      that.loadComponents();

      // Enable auto refresh.
      that.models.toggleAutoUIRefresh($.proxy(that.ui.UpdateModelList, that.ui), 5000, true);

      var vm = new Vue({
        el: "#app",
        data: that.getTemplateData()
      });

      // Store reference to VM:
      that.vm = vm;
    });

  };

  // Returns a reference to our template data.
  App.prototype.getTemplateData = function()
  {
    return this.TemplateData;
  };

  // Returns a reference to the UI component
  App.prototype.getUI = function()
  {
    return this.ui;
  };

  App.prototype.getModels = function()
  {
    return this.models;
  };

  // Load our main template, callback is called when this is finished.
  App.prototype.loadTemplate = function(callback) {

    // We load the file in the template container;
    $("#template-container").load("templates/templates.html", callback);
  };

  App.prototype.loadComponents = function()
  {
    // Not the only one who has issues with this: http://forum.vuejs.org/topic/344/how-do-you-handle-eslint-no-unused-vars-warning/8
    /*eslint-disable no-unused-vars */

    var modeldetails = new ModelDetails(this, this.models);
    var componenthome = new ComponentHome(this);
    var componentmodellist = new ComponentModelList(this);

    /*eslint-enable no-unused-vars */

  };

  return {
    App: App
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
}
