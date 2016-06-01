/* global Vue,  fetchTemplates */

// Exported globals
var ScenarioCreate;

var exports = (function() {
  "use strict";

  // a separate function that we can test.
  function factorToArray(variable) {
    if (!_.get(variable, "factor")) {
      // if variable is not a factor return the value
      return variable.value;
    }
    // split it up
    var tagsArray = _.split(variable.value, ",");

    // if we have a number, return numbers
    if (variable.type === "numeric") {
      // convert to number
      var numbers = _.map(
        tagsArray,
        _.toNumber
      );

      // otherwise return the strings
      tagsArray = numbers;
    }
    return tagsArray;
  }


  // Constructor of our component
  ScenarioCreate = Vue.component("scenario-builder", {
    template: "#template-scenario-builder",

    data: function() {
      return {
        availableTemplates: [],

        // The scenario as configured by the user at the moment.
        scenarioConfig: {},

        // the current template
        template: null
      };
    },

    props: {
      data: Array
    },

    created: function() {
      fetchTemplates()
        .then((templates) => {
          this.availableTemplates = templates;

          // Select the first template automatic:
          var template = _.get(this.availableTemplates, 0);

          // set the template, somehow a computed setter was not working...
          this.selectTemplate(template);

        });


    },

    route: {
      data: function(transition) {
        transition.next();
      }
    },

    validators: { // `numeric` and `url` custom validator is local registration
      max: function (val, rule) {
        // create a value object and split up the value
        var vals = factorToArray({
          factor: true,
          value: val,
          type: "numeric"
        });

        // check if any value is > rule
        var valid = _.every(vals, function(x) {
          return x <= rule;
        });

        return valid;
      },
      min: function (val, rule) {
        var vals = factorToArray({
          factor: true,
          value: val,
          type: "numeric"
        });

        // check if any value is > rule
        var valid = _.every(vals, function(x) {
          return x >= rule;
        });

        return valid;
      }
    },
    computed: {
      totalRuns: {
        cache: false,
        get: function() {
          var totalRuns = 1;

          // lookup all variables
          var variables = _.flatMap(
            this.scenarioConfig.sections,
            function(section) {
              return section.variables;
            }
          );

          // lookup number of runs per variable
          var runs = _.map(
            variables,
            // use an arrow because we need this
            (variable) => {
              // by default we have 1 run
              var n = 1;

              // unless we have a factor, then it's the number of values
              if (variable.factor) {
                n = factorToArray(variable).length;
              }
              return n;
              // we need to access a function
            });

          // reduce product
          totalRuns = _.reduce(runs, function(prod, n) {
            return prod * n;
          }, 1);
          return totalRuns;

        }
      }
    },
    methods: {
      selectTemplate: function(template) {
        console.log("setting template to", template);

        // First set data, then the template. Order is important!
        this.scenarioConfig = this.prepareScenarioConfig(template);

        this.updateWithQueryParameters();

        // set the selected template
        this.template = template;

        // Initialize the tooltips:
        // We do this after the DOM update.
        Vue.nextTick(function () {
          $("[data-toggle='tooltip']").tooltip();
          $("input[data-role=tagsinput], select[multiple][data-role=tagsinput]").tagsinput();
        });

      },


      updateWithQueryParameters: function() {
        if (_.has(this.$route, "query.parameters")) {
          // get parameters from query
          var parameters = JSON.parse(this.$route.query.parameters);

          // assign all parameters of the scenario
          _.assign(this.scenarioConfig, parameters);
        }
        // This is a bit ugly, but if we have a name, add (copy) to it and then use it.
        if (_.has(this.$route, "query.name") && _.has(this.scenarioConfig, "scenarioname.value")) {
          // we also have a name
          var name = this.$route.query.name;

          // reuse it and create (copy) (copy) (over) (roger)
          this.scenarioConfig.scenarioname.value = name + " (copy)";
        }
      },

      submitScenario: function() {

        var parameters = {},
            name = "";

        // map each variable in each section to parameters
        _.forEach(this.scenarioConfig.sections, function(section) {
          _.forEach(section.variables, function(variable) {
            if(variable.id === "name") {
              name = variable.value;
            } else {
              parameters[variable.id] = {
                "values": variable.value,
                "units": variable.units
              };
            }
          });
        });

        var postdata = {
          "name": name,
          "template": null,
          "parameters": JSON.stringify(parameters)
        };

        $.ajax({
          url: "/api/v1/scenarios/",
          data: postdata,
          method: "POST"
        })
          .done(() => {
            // Go back to home.
            var params = {
            };

            // This is not practical, but the only way in vue? (using $parent)
            this.$parent.$broadcast("show-alert", { message: "Scenario submitted", showTime: 5000, type: "info"});
            this.$router.go({
              name: "home",
              params: params
            });

          });
      },


      // We have to prepare the scenario config
      prepareScenarioConfig: function(data) {

        // create a deep copy so we don't change the template
        var scenario = _.cloneDeep(data);

        // Loop through all variables and set the default value:
        var sections = scenario.sections;


        // flatten variables
        _.forEach(sections, function(section) {
          // Loop through all category vars
          _.forEach(section.variables, function(variable) {

            // Set Default value
            variable.value = _.get(variable, "default");
            // Set factor to false
            variable.factor = _.get(variable, "factor", false);

          });

        });

        return scenario;
      }
    }
  });
  return {
    ScenarioCreate: ScenarioCreate,
    factorToArray: factorToArray
  };

}());


// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
}
