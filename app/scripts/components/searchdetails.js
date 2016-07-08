/* global Vue, fetchTemplates */

var exports = (function () {
  "use strict";
  var SearchDetails = Vue.component("search-details", {
    // not much in here.
    template: "#template-search-details",
    data: function() {
      return {
        selectedTemplates: [],
        templates: [],
        shared: [],
        selectedParameters: {
          riverwidth: null,
          riverdischarge: null,
          engine: []
        },
        startDate: null,
        endDate: null,
        text: "",

        // Template used for searching (probably always one)
        searchTemplates: []
      };
    },
    props: {

    },

	ready: function() {

      fetchSearchTemplates().then((templates) => {

        console.log("loading search");
      //  console.log(templates.sections);
        this.searchTemplates = templates[0];
        this.templates = templates[0].templates;

      this.$nextTick(
            function() {
              // once the dom is updated, update the select pickers by hand
              // template data is computed into modelEngine
              $("#template").selectpicker("refresh");
              $("#template").selectpicker("selectAll");
              $("#model-engine").selectpicker("refresh");
              $("#model-engine").selectpicker("selectAll");
              $(".ion-range").ionRangeSlider({
                onFinish: () => {
                  // args: data, not used
                  this.search();
                }
              });

            }
          );

      });


      // old code:
      // fetchTemplates()
      //   .then((templates) => {
      //     console.log("loaded templates", templates);
      //     this.templates = templates;
      //     this.$nextTick(
      //       function() {
      //         // once the dom is updated, update the select pickers by hand
      //         // template data is computed into modelEngine
      //         $("#template").selectpicker("refresh");
      //         $("#template").selectpicker("selectAll");
      //         $("#model-engine").selectpicker("refresh");
      //         $("#model-engine").selectpicker("selectAll");
      //         $(".ion-range").ionRangeSlider({
      //           onFinish: () => {
      //             // args: data, not used
      //             this.search();
      //           }
      //         });

      //       }
      //     );

      //   });
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
          template: this.selectedTemplates
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
          url: "/api/v1/scenes/",
          data: params,
          // no [] in params
          traditional: true,
          dataType: "json"
        };
      },

      search: function() {
        // create the url and stuff
        var request = this.buildRequest();
        var that = this;

        console.log("sending SEARCH request", request);
        $.ajax(request)
          .then(function(data) {
            that.$dispatch("models-found", data);
          })
          .fail(function(err) {
            console.log(err);
          });
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
