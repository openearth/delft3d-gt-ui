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

        // Calculated total runs.
        totalRuns: 1,

        // Is the form completely valid? (Used to automatically set class on submit button)
        formIsValid: true,

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

    beforeCompile: function() {
      // Placeholder for events
    },

    attached: function() {
      // Placeholder for events
    },


    ready: function() {

      // Perform validate at start:
      this.validateForm();
      this.validateAllFields();

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

        this.validateForm();
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
      validateForm: function() {

        //var validation = new InputValidation();
        var valid = true;

        // If we have no templateid, we bail out immediatly:
        if (!this.template) {
          valid = false;
        }

        // Loop through all fields and determine if we have a completely valid form.
        // Set form valid state:
        $.each(this.scenarioConfig, function(varKey, varValue) {

          if (varValue.valid === false) {

            // The form is not valid. We vail out immediatly of this loop and updatye the form with the new value.
            valid = false;
            return;
          }

        });

        // Submit button will be disabled:
        this.formIsValid = valid;

      },

      submitScenario: function() {

        var that = this;

        // Prepare variables types (make sure numbers are really of a numeric type)
        var config = {};

        $.each(this.scenarioConfig, function(varKey, varValue) {

          // If this seems to be numeric, make it an int.
          if ($.isNumeric(varValue.value) === true) {
            varValue.value = parseFloat(varValue.value);
          }

          varValue.maxstep = parseFloat(varValue.maxstep);
          varValue.minstep = parseFloat(varValue.minstep);
          varValue.stepinterval = parseFloat(varValue.stepinterval);

          config[varKey] = varValue;

        });

        var postdata = {
          templateid: this.template.templateid, // Temp!
          scenariosettings: JSON.stringify(config)
        };

        $.ajax({
          url: "/scenario/create",
          data: postdata,
          method: "POST"
        }).done(function() {

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

      // Loop through all configured variables and validate.
      validateAllFields: function() {
        var that = this;

        $.each(this.scenarioConfig, function(varKey, varValue) {

          that.validateField(varValue);

        });

      },

      // This function is a work in progress, we need to use the InputValidation class.
      // For now it is a quick demo to show some interactivity for numeric fields.
      // Function also receives an "event" variable as second argument, but it is unused.
      validateField: function(variable) {

        // The variable as configured in this scenario:
        var configuredVar = this.scenarioConfig[variable.variableid];

        // Current value of the element.
        //var val = ($(event.target).val());
        var val = configuredVar.value;
        var valid = true;

        // Min max from template
        var min = variable.min;
        var max = variable.max;

        var validation = new InputValidation();

        // Check if the variable is ok:
        // Check var type, if we have a min max:
        switch (variable.type) {
          // Numeric types
        case "numeric":



          val = parseFloat(val);



          // Are we auto stepping? And is there a multipler of? Then check the interval - it should match the multiple of.
          if (configuredVar.useautostep === true) {

            var interval = parseFloat(configuredVar.stepinterval);


            if (variable.stepoptions.multipleof > 0) {


              valid = valid && (validation.isMultipleOf(interval, variable.stepoptions.multipleof));
            }

            // Check if the stepping values are still in range:
            valid = valid && validation.validateNumberInRange(configuredVar.minstep, min, max);
            valid = valid && validation.validateNumberInRange(configuredVar.maxstep, min, max);

            var maxStepValue = max;

            if (maxStepValue < min) {
              console.error("Max is < min");
              // If max is 0, then we assume an infinite limit was rather meant.
              if (maxStepValue === 0) {
                maxStepValue = Number.MAX_VALUE;
              }
            }
            // Min value should be lower than max:
            valid = valid && (configuredVar.minstep < configuredVar.maxstep);

            // Interval cannot be larger than max - min.
            valid = valid && (interval <= (maxStepValue - min));

            // Step interval should always be >= 0.
            valid = valid && (interval > 0);

          } else {

            valid = validation.validateNumberInRange(val, min, max);

            // multiple of check also applies to normal number input:
            if (variable.stepoptions.multipleof > 0) {
              valid = valid && (validation.isMultipleOf(val, variable.stepoptions.multipleof));
            }

          }

          // Check if we have a group.
          if (configuredVar.group.length > 0) {
            var groupSum = this.calculateGroupSum(configuredVar.group);

            // What is the target?
            if (this.template.groups[configuredVar.group] !== undefined) {
              var targetVal = parseFloat(this.template.groups[configuredVar.group].targetvalue);

              valid = valid && (targetVal === groupSum);
            }

          }


          // Make sure the number becomes a float:
           this.scenarioConfig[variable.variableid].value = val;


          break;

          // Text types:
        case "text":

          // Min / max are used for the length:
          valid = valid && validation.validateAsciiStringLength(val, min, max);

          break;

        default:

          console.log("Unknown variable type:" + variable.type);

        }

        // We update the variable valid state in our config object. Then the UI will automatically reflect the state.
        // And color rows as needed.
        this.setVariableValidationState(variable.variableid, valid);



        // If this value is in a group, and invalid, then we make all other group members invalid as well.
        if (variable.group !== undefined) {
          this.setGroupValidationState(variable.group, valid);
        }

        // Calculate amount of runs that are expected.
        this.calculatetotalRuns();

        // Validate entire form
        this.validateForm();
      },

      // We go through all variables and add all the values that share the groupname.
      // The sum is returned
      calculateGroupSum: function(groupname) {

        var totalValue = 0;

        $.each(this.scenarioConfig, function(varKey, varValue) {

          if (varValue.group === groupname) {

            // Assuming always numeric here.
            totalValue += parseFloat(varValue.value);
          }

        });

        return totalValue;

      },


      // Set validation state of group:
      setGroupValidationState: function(groupName, state) {
        // If it's an empty name, we just exit.
        if (groupName.length === 0) {
          return;
        }

        var that = this;

        // We loop through all fields and change the group validation state for all variables that match the group name.
        $.each(this.scenarioConfig, function(variableId, varValue) {

          if (varValue.group === groupName) {
            that.setVariableValidationState(variableId, state);
          }

        });
      },

      setVariableValidationState: function(variableId, state) {
        this.scenarioConfig[variableId].valid = state;
      },

      /// User has clicked on an autostep toggle in the GUI. Process this event.
      toggleAutoStep: function(variable, event) {

        this.validateField(variable, event);

        this.calculatetotalRuns();

      },

      // Calculate total number of runs this scenario contains so far.
      // It's either 1. Or multiple, because of interval steps. We take a rough calculation here first.
      calculatetotalRuns: function() {

        var totalRuns = 1;

        $.each(this.scenarioConfig, function(varKey, varValue) {

          // This model uses autostepping, so we calculate how many there are in there.
          if (varValue.useautostep === true) {

            var stepInterval = varValue.stepinterval;

            if (stepInterval > 0) {
              var diff = (Math.abs(varValue.maxstep - varValue.minstep) / stepInterval) + 1;

              // We multiply the number of runs with every interval.
              totalRuns *= diff;
            }

          }
        });



        console.log(totalRuns);

        // Store back in config.
        this.totalRuns = Math.ceil(totalRuns);

      },

      // We have to prepare the scenario config
      prepareScenarioConfig: function(data) {

        // create a deep copy so we don't change the template
        var scenario = _.cloneDeep(data);

        // TODO: the first level of variables are sections, not variables
        // FIX at the source
        scenario.sections = scenario.variables;
        delete scenario.variables;

        // Loop through all variables and set the default value:
        var sections = scenario.sections;

        // flatten variables
        _.forEach(sections, function(section) {
          // Loop through all category vars
          _.forEach(section.variables, function(variable) {

            // Set all the defaults

            // Set Default value
            variable.value = variable.default;
            // We assume everything is ok
            variable.valid = true;
            // Do not use autostep by default
            variable.useautostep = false;
            // Default step min is min value of this var
            variable.minstep = parseFloat(variable.min);
            // Default step max is max value of this var
            variable.maxstep = parseFloat(variable.max);
            // Default step from the template
            variable.stepinterval =parseFloat(variable.stepoptions.defaultstep);

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
