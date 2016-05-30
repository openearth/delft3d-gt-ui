/* global Vue, InputValidation, fetchTemplates, router */

// Exported globals
var ScenarioCreate;

var exports = (function() {
  "use strict";

  // Constructor of our component
  ScenarioCreate = Vue.component("scenario-builder", {
    template: "#template-scenario-builder",

    data: function() {
      return {
        availableTemplates: [],

        // The scenario as configured by the user at the moment.
        scenarioConfig: {},

        // the current template
        template : null
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
          this.selectTemplate(template);

        });


    },

    route: {
      data: function(transition) {
        console.log("transition", transition);

        transition.next();
      }
    },

    validators: { // `numeric` and `url` custom validator is local registration
      max: function (val, rule) {
        var vals = this.vm.factorToArray({
          factor: true,
          value: val,
          type: 'numeric'
        });
        // check if any value is > rule
        var valid = _.every(vals, function(x) {return x <= rule;});
        return valid;
      },
      min: function (val, rule) {
        var vals = this.vm.factorToArray({
          factor: true,
          value: val,
          type: 'numeric'
        });
        // check if any value is > rule
        var valid = _.every(vals, function(x) {return x >= rule;});
        return valid;
      }
    },
    computed: {
      totalRuns:{
        cache: false,
        get: function() {
          var totalRuns = 1;

          // lookup all variables
          var variables = _.flatMap(
            this.scenarioConfig.sections,
            function(section){return section.variables;}
          );

          // lookup number of runs per variable
          var runs = _.map(
            variables,
            function(variable) {
              var n = 1;
              if (variable.factor) {
                n = this.factorToArray(variable).length;
              }
              return n;
            }.bind(this));
          // reduce product
          totalRuns = _.reduce(runs, function(prod, n) {
            return prod * n;
          }, 1);
          return totalRuns;

        }
      }


    },
    methods: {
      factorToArray: function(variable) {
        if (!_.get(variable, 'factor')) {
          // if variable is not a factor return the value
          return variable.value;
        };
        var tagsArray =  _.split(variable.value, ',');

        // if we have a number, return numbers
        if (variable.type === 'numeric') {
          var numbers = _.map(
            tagsArray,
            _.toNumber
          );
          // otherwise return the strings
          tagsArray = numbers;
        }
        return tagsArray;
      },
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

          // assign all parameters ot the scenario
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

        var postdata = {
          scenario: JSON.stringify(this.scenarioConfig)
        };

        $.ajax({
          url: "/scenario/create",
          data: postdata,
          method: "POST"
        })
          .done(function() {
            // Go back to home.
            var params = {
            };
            // This is not practical, but the only way in vue? (using $parent)
            that.$parent.$broadcast("show-alert", { message: "Scenario submitted", showTime: 5000, type: "info"});
            router.go({
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
            variable.value = _.get(variable, 'default');
            // Set factor to false
            variable.factor = _.get(variable, 'factor', false);

          });

        });

        return scenario;
      }
    }
  });
  return {
    ScenarioCreate: ScenarioCreate
  };

}());


// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
}
