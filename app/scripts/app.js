/* global UI, Models, Vue, ModelDetails,ComponentHome,ComponentModelList*/
//import modelList from "templates/list-running-models.vue";

var App;

var exports = (function() {
  "use strict";


  // Constructor of our UI class
  App = function() {


    // Main javascript code, initialize components, there shouldn"t be much here.

    // Our shared template data:
    this.TemplateData = {
      models: {
        gridColumns: ["run #", "Status", "Est. time left", ""],

        searchQuery: "",
        gridData: []

      },
      logoutput: "",
      currentView: "home",
      selectedModel: null,
      selectedModelID: 0
    };

  };

  // We call this separate so our tests do not use JQuery.
  App.prototype.loadMainTemplate = function(callback) {

    // Move these files to an app class later.
    this.models = [];


    var vm = new Vue({
      el: "#app",
      data: this.getTemplateData()
    });

    // Store reference to VM:
    this.vm = vm;

    // Call parent callback if ready

    if (callback !== undefined) {
      callback();
    }
  };


  // Returns a reference to our template data.
  App.prototype.getTemplateData = function() {
    return this.TemplateData;
  };

  // Returns a reference to the UI component
  App.prototype.getUI = function() {
    return this.ui;
  };

  App.prototype.getModels = function() {
    return this.models;
  };

  // Load our main template, callback is called when this is finished.
  App.prototype.loadTemplate = function(callback) {

    // We load the file in the template container;
    $("#template-container").load("templates/templates.html", callback);
  };
})();
