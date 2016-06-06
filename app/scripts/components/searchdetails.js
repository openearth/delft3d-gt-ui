/* global Vue */

var exports = (function () {
  "use strict";
  var SearchDetails = Vue.component("search-details", {
    // not much in here.
    template: "#template-search-details",
    data: function() {
      return {
        selectedTemplates: [],
        templates: [],
        parameters: {
          "river-width": null,
          "river-discharge": null,
          "engines": []
        },
        shared: [],
        startDate: null,
        endDate: null,
        text: ""

      };
    },
    ready: function() {
      $(".ion-range").ionRangeSlider({
        onFinish: () => {
          // args: data, not used
          this.search();
        }
      });
      fetchTemplates()
        .then((templates) => {
          console.log("loaded templates", templates);
          this.templates = templates;
          this.$nextTick(
            function() {
              // once the dom is updated, update the select pickers by hand
              // template data is computed into modelEngine
              $("#template").selectpicker("refresh");
              $("#template").selectpicker("selectAll");
              $("#model-engine").selectpicker("refresh");
              $("#model-engine").selectpicker("selectAll");

            }
          );

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
      }
    },


    methods: {
      buildRequest: function() {
        // for now we just copy everything

        var params = {
          name: this.name,
          state: this.state,
          scenario: this.scenario,
          template: this.selectedTemplates
        };

        // serialize parameters corresponding to https://publicwiki.deltares.nl/display/Delft3DGT/Search
        params.parameters = _.map(
          // loop over all parameters in the template
          this.parameters,
          function(value, key) {
            var result = "";
            if (value.includes(";")) {
              result = key + "," + _.join(",", value.split(";"));
            } else {
              result = "key" + "," + value;
            }
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
        $.ajax(this.buildRequest())
          .then(function(data) {
            // TODO: set this data in the model-list models property
            console.log("data", data);
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
