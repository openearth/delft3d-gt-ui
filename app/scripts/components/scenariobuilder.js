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
        template: null,

        dataLoaded: false,

        currentSelectedId: null,

        // The DOM elements used for the fixed toolbar event listener
        navBars: null,

        forceTemplateUpdate: false

      };
    },

    created: function() {

    },
    route: {

      activate: function (transition) {
        // We force the template to be reloaded when this page is openend
        // Otherwise old values will stay in the form, and the validator is not reactivated.
        // The data function changes the function if needed.
        this.currentSelectedId = null;
        this.template = null;
        this.fetchTemplateList();

        transition.next();

      },
      data: function(transition) {


        // if we have a template in the request, select that one
        if (_.has(this, "$route.query.template")) {

          // This cannot go into the fetchTemplates, template will always be empty!
          var templateId = parseInt(this.$route.query.template);
          var template = _.first(_.filter(this.availableTemplates, ["id", templateId]));

          if (template !== undefined) {
            this.selectTemplate(template);
          }
        }

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
      },

      validForm: {
        cache: false,
        get: function() {
          if (this.$validation) {
            return this.$validation.valid;
          }
          return true;
        }
      }
    },
    methods: {
      // check if variable should generate an input element
      isInput: function(variable) {
        return _.includes(["numeric", "text", "semver"], variable.type) || variable.factor;
      },
      // Moved so that we can test it better.
      fetchTemplateList: function() {

        fetchTemplates()
          .then((templates) => {
            this.availableTemplates = _.sortBy(templates, ["name"]);

            // Select the first template automatic:
            var template = _.get(this.availableTemplates, 0);

            // if we have a template in the request, select that one
            if (_.has(this, "$route.query.template")) {
              var templateId = parseInt(this.$route.query.template);

              template = _.first(_.filter(this.availableTemplates, ["id", templateId]));
              console.log("setting template", template);
            }

            // set the template, somehow a computed setter was not working...
            this.selectTemplate(template);

            this.dataLoaded = true;

          });
      },

      selectTemplate: function(template) {

        if (template === null) {
          return;
        }

        //  Did the template change? Or maybe forcing an update
        if (this.currentSelectedId === template.id) {
          return;
        }


        this.currentSelectedId = template.id;

        // First set data, then the template. Order is important!
        this.scenarioConfig = this.prepareScenarioConfig(template);

        this.updateWithQueryParameters();

        // set the selected template
        this.template = template;

        // Initialize the tooltips:
        // We do this after the DOM update.
        this.$nextTick(function () {

          this.updateAfterTick();
        });
      },

      updateAfterTick: function() {

        if ($("[data-toggle='tooltip']").tooltip !== undefined) {

          $("[data-toggle='tooltip']").tooltip({
            html: true,
            // hover activation annoys some people
            trigger: "click"
          });
        }

        $("input[data-role=tagsinput], select[multiple][data-role=tagsinput]").each((i, el) => {
          // lookup corresponding variable
          //var variables = _.flatMap(this.scenarioConfig.sections, "variables");
          //var variable = _.head(_.filter(variables, ["id", el.id]));

          //if (variable.type === "select") {

          $(el).tagsinput();
          //} else {
          // $(el).tagsinput();
          //}
        });

      },

      // Return a unique id for the variable that is validated.
      // When selecting another template, the validator cannot deal
      // with variable with the same name.
      getId: function(variable) {
        return this.scenarioConfig.id + "," + variable.id;
      },

      updateWithQueryParameters: function() {

        if (_.has(this, "$route.query.parameters")) {

          // get parameters from query
          var parameters = JSON.parse(this.$route.query.parameters);

        }


        // the request has parameters in the form of {"variable": {"values": value}}
        // the scenarioConfig also has sections {"sections": [{"variables": [{"variable": {"value": []}}]}]}

        // let's create a flat list of variables
        var variables = _.flatMap(this.scenarioConfig.sections, "variables");

        // loop over all variables in the filled in template
        _.each(
          variables,
          function(variable) {
            // does this template variable have a corresponding variable in the request parameters
            if (_.has(parameters, variable.id)) {
              if (variable.factor) {
                // join by columns for tag input
                variable.value = _.join(parameters[variable.id].values, ",");
              } else {
                // just set it (first item)
                variable.value = _.get(parameters[variable.id].values, 0);
              }

            }
          }
        );

        // This is a bit ugly, but if we have a name, add (copy) to it and then use it.
        if (_.has(this, "$route.query.name") && _.has(this.scenarioConfig, "name")) {
          // we also have a name
          var name = this.$route.query.name;

          // reuse it and create (copy) (copy) (over) (roger)
          this.scenarioConfig.name = name + " (copy)";


          // the name variable is special, because it's duplicated
          var nameVariable = _.first(_.filter(variables, ["id", "name"]));

          if (nameVariable) {
            // also set the name to the variable
            nameVariable.value = this.scenarioConfig.name;
          }



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

              var valuearray = _.map(("" + variable.value).split(","), function(d) {
                // try and parse
                var parsed = parseFloat(d);

                // if we have a number return parsed otherwise original string
                var result = (_.isNumber(parsed) && !isNaN(parsed)) ? parsed : d;

                return result;
              });

              parameters[variable.id] = {
                values: valuearray,
                // we need these in the table
                // if they are not available they should drop during submission
                units: variable.units,
                name: variable.name,
                description: variable.description
              };
            }
          });
        });

        var postdata = {
          "name": name,
          "template": this.currentSelectedId,
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
            // Initialise fraction so that vue can use it
            variable.inputValue = variable.value;
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
