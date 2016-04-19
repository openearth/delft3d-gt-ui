/* global Vue, InputValidation */

// Exported globals
var ScenarioBuilder;

var exports = (function() {
  "use strict";

  // Constructor of our component
  ScenarioBuilder = function(app) {

    // Store reference to our app
    this.app = app;

    //var that = this;

    // register the grid component
    Vue.component("scenario-builder", {
      template: "#template-scenario-builder",

      data: function() {
        return {
          availabletemplates: null,

          // The scenario as configured by the user at the moment.
          scenarioconfig: {},

          // Calculated total runs.
          totalruns: 1,

          // Is the form completely valid? (Used to automatically set class on submit button)
          formIsValid: true
        };
      },

      props: {
        data: Array

      },

      activate: function(done) {
        var that = this;

        //Load test template data:
        $.ajax({
            url: "sampledata/template.json",
            method: "GET"
          })
          .done(function(data) {
            // Build the prepared variables which are linked to the model automatically through the v-model function of VUE
            // This does not look so good. But I cannot find a different solution with Vue.
            var c = that.prepareScenarioConfig(data);

            that.scenarioconfig = c;

            // Store available templates:
            that.availabletemplates = data;

            done();

          });
      },

      beforeCompile: function() {

      },

      attached: function() {

      },


      ready: function() {
        // Perform validate at start:
        this.validateForm();
      },

      methods: {

        validateForm: function() {

          //var validation = new InputValidation();
          var valid = true;

          // Loop through all fields and determine if we have a completely valid form.
          // Set form valid state:
          $.each(this.scenarioconfig, function(varkey, varvalue) {

            if (varvalue.valid === false) {

              // The form is not valid. We vail out immediatly of this loop and updatye the form with the new value.
              valid = false;

              return;
            }

          });

          // Submit button will be disabled:
          this.formIsValid = valid;
        },

        submitScenario: function() {


          var postdata = {
            templateid: this.availabletemplates.templateid, // Temp!
            scenariosettings: this.scenarioconfig
          };

          $.ajax({
            url: "/scenario/create",
            data: JSON.stringify(postdata),
            method: "POST"
          }).done(function(data) {
            console.log(data);
          });
        },

        // This function is a work in progress, we need to use the InputValidation class.
        // For now it is a quick demo to show some interactivity for numeric fields.
        // Function also receives an "event" variable as second argument, but it is unused.
        validateField: function(variable) {

          // The variable as configured in this scenario:
          var configuredvar = this.scenarioconfig[variable.variableid];

          // Current value of the element.
          //var val = ($(event.target).val());
          var val = configuredvar.value;
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
              if (configuredvar.useautostep === true) {

                var interval = parseFloat(configuredvar.stepinterval);

                if (variable.stepoptions.multipleof > 0) {


                  valid = valid && (validation.isMultipleOf(interval, variable.stepoptions.multipleof));
                }

                // Check if the stepping values are still in range:
                valid = valid && validation.validateNumberInRange(configuredvar.minstep, min, max);
                valid = valid && validation.validateNumberInRange(configuredvar.maxstep, min, max);

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
              if (configuredvar.group.length > 0) {
                var groupSum = this.calculateGroupSum(configuredvar.group);

                // What is the target?
                if (this.availabletemplates.groups[configuredvar.group] !== undefined) {
                  var targetVal = parseFloat(this.availabletemplates.groups[configuredvar.group].targetvalue);

                  valid = valid && (targetVal === groupSum);
                }

              }

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
          this.calculateTotalRuns();

          // Validate entire form
          this.validateForm();
        },

        // We go through all variables and add all the values that share the groupname.
        // The sum is returned
        calculateGroupSum: function(groupname) {

          var totalvalue = 0;

          $.each(this.scenarioconfig, function(varkey, varvalue) {

            if (varvalue.group === groupname) {

              // Assuming always numeric here.
              totalvalue += parseFloat(varvalue.value);
            }

          });

          return totalvalue;

        },


        // Set validation state of group:
        setGroupValidationState: function(groupname, state) {
          // If it's an empty name, we just exit.
          if (groupname.length === 0) {
            return;
          }

          var that = this;

          // We loop through all fields and rese
          $.each(this.scenarioconfig, function(variableid, varvalue) {

            if (varvalue.group === groupname) {
              that.setVariableValidationState(variableid, state);
            }

          });
        },

        setVariableValidationState: function(variableid, state) {
          this.scenarioconfig[variableid].valid = state;
        },

        /// User has clicked on an autostep toggle in the GUI. Process this event.
        toggleAutoStep: function(variable, event) {

          this.validateField(variable, event);

          this.calculateTotalRuns();

        },

        // Calculate total number of runs this scenario contains so far.
        // It's either 1. Or multiple, because of interval steps. We take a rough calculation here first.
        calculateTotalRuns: function() {

          var totalruns = 1;

          $.each(this.scenarioconfig, function(varkey, varvalue) {

            // This model uses autostepping, so we calculate how many there are in there.
            if (varvalue.useautostep === true) {

              var stepinterval = varvalue.stepinterval;

              if (stepinterval > 0) {
                var diff = Math.abs(varvalue.maxstep - varvalue.minstep) / stepinterval;

                // We multiply the number of runs with every interval.
                totalruns *= diff;
              }

            }
          });



          console.log(totalruns);

          // Store back in config.
          this.totalruns = Math.ceil(totalruns);

        },

        // We have to prepare the scenario config
        prepareScenarioConfig: function(data) {
          var config = {};

          if (data === undefined) {
            return config;
          }

          // Loop through all variables and set the default value:
          $.each(data.variables, function(categorykey, categoryvalue) {

            // Loop through all category vars
            $.each(categoryvalue.variables, function(varkey, varvalue) {

              var group = "";

              if (varvalue.group !== undefined) {
                group = varvalue.group;
              }

              config[varvalue.variableid] = {
                value: varvalue.default, // Default value
                valid: true, // We assume everything is ok

                useautostep: false, // Do not use autostep by default
                minstep: varvalue.min, // Default step min is min value of this var
                maxstep: varvalue.max, // Default step max is max value of this var
                stepinterval: varvalue.stepoptions.defaultstep, // Default step from the template
                group: group // Group name, for shared variables.
              };



            });

          });

          //  console.log(JSON.stringify(config));

          return config;
        }
      }
    });
  };

  return {
    ScenarioBuilder: ScenarioBuilder
  };

}());


// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
}
