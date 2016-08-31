/* global Vue, fetchSearchTemplate */
var aa;
var exports = (function () {
  "use strict";
  var SearchDetails = Vue.component("search-details", {

    // not much in here.
    template: "#template-search-details",
    data: function() {
      return {

        // all the user input that is not in a template parameter
        searchText: "",
        selectedParameters: {},
        selectedTemplates: [],
        selectedDomains: [],

        // Template used for searching (probably always one)
        searchTemplate: null

      };
    },

    ready: function() {
      // get search templates
      fetchSearchTemplate()
        .then((templates) => {
          // store them
          this.searchTemplate = templates;
          // after we're done loading the templates in the dom, start searching.

          this.$nextTick(
            () => {
              // update ui
              this.updatePickers();
              // Keep syncing:
              setInterval(this.sync, 10000);
            }
          );

        });

    },
    computed: {
      modelEngines: {
        get: function () {
          // flatten variables
          var variables = _.flatMap(_.flatMap(this.templates, "sections"), "variables");

          // lookup all variables with id engine (convention)
          var engines = _.filter(variables, ["id", "engine"]);

          // lookup default values (filter on model/scenarios later)
          var defaultEngines = _.uniq(_.map(engines, "default"));

          return defaultEngines;

        }
      },
      parameters: {
        get: function() {
          var parameters = {};
          var variables = _.flatMap(
            _.flatMap(this.templates, "sections"),
            "variables"
          );

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
      updatePickers: function() {
        // once the dom is updated, update the select pickers by hand
        // template data is computed into modelEngine
        var pickers = $(".select-picker");

        if (pickers.selectpicker !== undefined) {
          pickers.selectpicker("refresh");
          pickers.selectpicker("selectAll");
        }


        /*eslint-disable camelcase*/
        if ($(".ion-range").ionRangeSlider !== undefined) {
          $(".ion-range").ionRangeSlider({
            force_edges: true,
            onFinish: () => {
              // args: data, not used
              this.search();
            }
          });
        }
        /*eslint-enable camelcase*/

        // Add event handler that allows one to use the X next to inputs to clear the input.
        $(".button-empty-input-field").on("click", () => {
          var input = $(this).closest("div").find("input");

          // Force update selected parameters.
          // Quick fix for selected parameter, should be a parameter later.
          var id = input.attr("id");

          if (id === "search") {
            this.searchText = "";
          } else {
            this.selectedParameters[id] = "";
          }
          // Search up to the div, and then find the input child. This is the actual input field.
          this.search();

        });


        // Set event handlers for search collapsibles.
        $(".panel-search").on("show.bs.collapse", function() {

          $(this).find(".glyphicon-triangle-right").removeClass("glyphicon-triangle-right").addClass("glyphicon-triangle-bottom");
        });

        $(".panel-search").on("hide.bs.collapse", function() {

          $(this).find(".glyphicon-triangle-bottom").removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-right");

        });


      },
      buildRequest: function() {
        // for now we just copy everything

        var params = {
          shared: this.domains,
          template: this.selectedTemplates,
          search: this.searchText
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
      fetchSearch: function() {
        var request = this.buildRequest();
        // return a promise
        return new Promise(function(resolve, reject) {

          //Load test template data:
          $.ajax(request)
            .done(function(data) {
              // return the one and only search template
              // the backend returns a list but there shall only be one
              resolve(data);
            })
            .fail(function(error) {
              reject(error);
            });
        });
      },
      sync: function() {
        // TODO: update items
        // fetchScenarios()
        //   .then((data) => {
        //     this.$dispatch('scenarios-updated', data);
        //   });
        // fetchModels()
        //   .then((data) => {
        //     this.$dispatch('models-updated', data);
        //   });
      },
      search: function() {

        // TODO: searching should be done in search-component, because it needs to update
        // details and search list

        // we want to update the search results and scenarios at the same time
        var promises = [this.fetchSearch(), fetchScenarios()];
        // once we have everything, we can update the items
        Promise.all(promises).then(
          (values) => {
            var models = values[0];
            var scenarios = values[1];

            models = _.uniqBy(models, "id");
            scenarios = _.uniqBy(scenarios, "id");

            // drop duplicates
            // TODO: models has duplicates
            var modelById = _.keyBy(models, "id");
            var scenarioById = _.keyBy(scenarios, "id");

            // first loop over all the scenarios
            var items = [];
            _.each(scenarios, (scenario) => {
              scenario.models = [];
              // loop over all models
              _.each(scenario.scene_set, (modelId) => {
                // store model in models
                var model = modelById[modelId];

                // properties that we need
                model.active = false;

                scenario.models.push(model);
              });

              // properties that we need
              scenario.active = false;
              items.push(scenario);
            });

            // now we can the orphan models
            // ids that are in a scenario
            var inScenario = _.uniq(_.flatMap(aa, 'scene_set'));
            // all ids
            var allIds = _.uniq(_.map(models, 'id'));
            // ids that are not in a scenario
            var orphanIds = _.difference(allIds, inScenario);

            // add the orphans to the list
            var orphans = _.map(orphanIds, (id) => {return modelById[id]; });
            _.each(orphans, (model) => {
              items.push(model);
            });

            console.log('items-found', items);
            this.$dispatch('items-found', items);
          }
        );
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
