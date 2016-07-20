/* global Vue, fetchSearchTemplates */

var exports = (function () {
  "use strict";
  var SearchDetails = Vue.component("search-details", {

    // not much in here.
    template: "#template-search-details",
    data: function() {
      return {
        selectedTemplates: [],

        // Fixed properties
        templates: [],
        shared: [],
        startDate: null,
        endDate: null,
        search: "",

        // This object will variables received from the templates.
        selectedParameters: { },

        // Template used for searching (probably always one)
        searchTemplates: []
      };
    },

	ready: function() {

  var that = this;

  fetchSearchTemplates().then((templates) => {


    if (templates === undefined) {
      return;
    }

    console.log("loading search");
  //  console.log(templates.sections);
    this.searchTemplates = templates[0];


    this.templates = templates[0].templates;

    var parameters = {};

    // Build list of all variables and assign them to selectedParameters:
    var variables = _.flatMap(_.flatMap(templates, "sections"), "variables");

    variables.forEach(function(variable) {

      parameters[variable.id] = "";

      if (variable.validators.min !== undefined && variable.validators.max !== undefined) {
        parameters[variable.id] = variable.validators.min + "," + variable.validators.max;
      }
    });

    that.selectedParameters = parameters;


    this.$nextTick(
          function() {
            // once the dom is updated, update the select pickers by hand
            // template data is computed into modelEngine
            $(".select-picker").selectpicker("refresh");
            $(".select-picker").selectpicker("selectAll");


            /*eslint-disable camelcase*/
            $(".ion-range").ionRangeSlider({
              force_edges: true,
              onFinish: () => {
                // args: data, not used
                this.startSearch();
              }
            });
            /*eslint-enable camelcase*/

            // Add event handler that allows one to use the X next to inputs to clear the input.
            $(".button-empty-input-field").on("click", function() {

              // Search up to the div, and then find the input child. This is the actual input field.
              $(this).closest("div").find("input").val("");
            });

            // Automatic search:
            setInterval(
                // create a callback for every second
                () => {
                  this.startSearch();
                },
                // every 10 seconds
                10000
              );

            // Set event handlers for search collapsibles.
            $(".panel-search").on("show.bs.collapse", function() {

              $(this).find(".glyphicon-triangle-right").removeClass("glyphicon-triangle-right").addClass("glyphicon-triangle-bottom");
            });

            $(".panel-search").on("hide.bs.collapse", function() {

              $(this).find(".glyphicon-triangle-bottom").removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-right");

            });


          });



  });

  $(".select-picker").selectpicker();

},
  computed: {
    modelEngines: {
      get: function () {
        // flatten variables
        var variables = _.flatMap(_.flatMap(this.templates, "sections"), "variables");

        // lookup all variables with id engine (convention)
        var engines = _.filter(variables, ["id", "engine"]);

        // lookup default values (filter on scenes/scenarios later)
        var defaultEngines = _.uniq(_.map(engines, "default"));

        return defaultEngines;

      }
    },

    parameters: {
      get: function() {
        var parameters = {};
        var variables = _.flatMap(_.flatMap(this.templates, "sections"), "variables");

        variables.forEach(function(variable) {
          if (_.has(variable, "validators.min") && _.has(variable, "validators.max")) {
            // create parameter info for forms
            var obj = {
              id: variable.id,
              min: _.get(variable, "validators.min"),
              max: _.get(variable, "validators.max")
            };

            parameters[variable.id] = obj;
          }
        });
        return parameters;
      }
    }
  },

  methods: {

    buildRequest: function() {
      // for now we just copy everything

      var params = {
        shared: this.shared,
        template: this.selectedTemplates,
        search: this.search
      };

      // serialize parameters corresponding to https://publicwiki.deltares.nl/display/Delft3DGT/Search
      params.parameter = _.map(
        // loop over all parameters in the template
        this.selectedParameters,
        function(value, key) {
          var result = "";

          if (_.isString(value) && value.includes(";")) {
            // replace ; by , =>  key,min,max
            // Breaks if someone uses ; in values (these originate from tags)
            result = key + "," + _.replace(value, ";", ",");
          } else {
            // replace ; by , =>  key,value
            result = key + "," + value;
          }

          // Remove trailing ,:
          result = result.replace(/\,$/, "");

          return result;
        }
      );
      return {
        // NEw url:
        url: "/api/v1/scenes/",
        data: params,
        // no [] in params
        traditional: true,
        dataType: "json"
      };
    },

    startSearch: function() {
      // create the url and stuff
      var request = this.buildRequest();
      var that = this;


      // We have to search in two parts. We need to requests scenarios, and runs.

      // Request scenarios (moidy url here temporarily)

      function dosearch() {

        // Initialize some placeholder vars.
        var dataScenarios = {};
        var dataRuns = {};

        var refcount = 0;


        // Decrease reference count. If 0, we continue with processing data.
        function decreaseRef() {
          refcount--;

          if (refcount <= 0) {

            var runCount = 0;
            var visibleScenarios = [];

            // Loop through all scenarios and add the runs that are part of it.
            dataScenarios.forEach(function(scenario) {

              // Loop through all scene_sets and use the id of each item to get info from the dataRuns list.
              var matchingRuns = [];

              scenario.scene_set.forEach(function(run) {

                var item = _.find(dataRuns, ["id", run]);

                if (item !== undefined) {
                  matchingRuns.push(item);
                }

              });

              runCount += matchingRuns.length;

              // Sort  array by name of run.
              var sorted = _.sortBy(matchingRuns, 'id');

              // Replace array:
              /*eslint-disable camelcase*/
              scenario.scene_set = sorted;
              /*eslint-enable camelcase*/


              // We only add scenarios that have atleast one item.
              if (matchingRuns.length > 0) {
                visibleScenarios.push(scenario);

              }

            });

            // Store updated scenario array.
            dataScenarios = visibleScenarios;

            console.log(dataScenarios.length + " / " + runCount);

           // console.log("done");
            that.$dispatch("modelsFound", dataScenarios, dataScenarios.length, runCount);
          }
        }

        refcount++;
        request.url = "/api/v1/scenarios/";
        //request.data = {}; //override for now.
        $.ajax(request)
          .then(function(data) {

            dataScenarios = data;

            decreaseRef();
          })
          .fail(function(err) {
            console.log(err);
          });

        // Request scenarios (modify url here temporarily)
        //console.log("sending SEARCH request - scenes part", request);
        refcount++;
        request.url = "/api/v1/scenes/";
        //request.data = {}; //override for now.
        $.ajax(request)
          .then(function(data) {

            dataRuns = data;

            decreaseRef();
          })
          .fail(function(err) {
            console.log(err);
          });

      }

      dosearch();


    }
  }
});

  return {
    SearchDetails: SearchDetails
  };
}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
