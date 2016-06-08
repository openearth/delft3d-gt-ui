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
    // el: "#template-scenario-builder",
    data: function() {
      return {
        availableTemplates: [],

        // The scenario as configured by the user at the moment.
        scenarioConfig: {},

        // the current template
        template: null,

        dataLoaded: false,
        componentReady: false,
        validSliderSections: {},
        validSliders: true,

        currentSelectedId: null,

        // The DOM elements used for the fixed toolbar event listener
        navBars: null

      };
    },

    created: function() {
      fetchTemplates()
        .then((templates) => {
          this.availableTemplates = templates;

          // Select the first template automatic:
          var template = _.get(this.availableTemplates, 0);

          // set the template, somehow a computed setter was not working...
          this.selectTemplate(template);

          this.dataLoaded = true;

          if (this.componentReady) {
            this.initAfterDomUpdate();
          }

        });


    },

    ready: function() {
      this.componentReady = true;
      this.navBars = {
        topBar: document.getElementById("top-bar"),
        toolBar: document.getElementById("tool-bar"),
        belowToolBar: document.getElementById("below-tool-bar")
      };
      this.initFixedToolbar();
      if (this.dataLoaded) {
        this.initAfterDomUpdate();
      }
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
      selectTemplate: function(template) {
        if (this.currentSelectedId === template.id) {
          return;
        }

        this.currentSelectedId = template.id;

        console.log("setting template to id", template.id);

        // First set data, then the template. Order is important!
        this.scenarioConfig = this.prepareScenarioConfig(template);

        // Init sliders if present
        this.initAfterDomUpdate();

        this.updateWithQueryParameters();

        // set the selected template
        this.template = template;

        // Initialize the tooltips:
        // We do this after the DOM update.
        this.$nextTick(function () {
          $("[data-toggle='tooltip']").tooltip();
          $("input[data-role=tagsinput], select[multiple][data-role=tagsinput]").tagsinput();
        });
      },

      // Return a unique id for the variable that is validated.
      // When selecting another template, the validator cannot deal
      // with variable with the same name.
      getId: function(variable) {
        return this.scenarioConfig.id + "," + variable.id;
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

              var valuearray = _.map(("" + variable.value).split(","), function(d) {
                return parseFloat(d) || d;
              });

              parameters[variable.id] = {
                "values": valuearray,
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
            // Initialise fraction so that vue can use it
            variable.inputValue = variable.value;
          });

        });

        return scenario;
      },

      // Do initializations after the DOM is updated.
      initAfterDomUpdate: function() {
        this.$nextTick(function () {
          this.initSliders();
        });
      },

      // Initialize the sliders if present
      initSliders: function() {
        var sections = this.scenarioConfig.sections;
        var that = this;

        _.forEach(sections, function(section) {
          var containsSlider = false;

          _.forEach(section.variables, function(variable) {
            if (variable.type === "slider") {
              containsSlider = true;
              var sliderConfig = {
                "min": 0,
                "max": section.slider.steps,
                "from": variable.inputValue,
                "step": 1,
                "grid": true,
                "grid_snap": true,
                "hide_min_max": true,
                "hide_from_to": true
              };

              sliderConfig.onChange = function() {
                that.updateSliders(section);
                that.checkSliderSectionsValid();
              };
              $("#" + variable.id).ionRangeSlider(sliderConfig);
            }
          });

          // Update the sliders for the first time
          if (containsSlider) {
            that.updateSliders(section);
          }
        });

      },

      // Update the sliders
      updateSliders: function(section) {
        var totalParts = 0;

        // Compute total parts set
        _.forEach(section.variables, function(variable) {
          if (variable.type === "slider") {
            totalParts += parseInt(variable.inputValue);
          }
        });

        //Check if the slider section is valid
        section.slider.valid = totalParts > 0;

        if (!section.slider.valid) {
          // Set totalParts to 1 to avoid division by zero
          totalParts = 1;
        }
        this.validSliderSections[section.name] = section.slider.valid;

        // Compute for each slider the fraction of the total
        _.forEach(section.variables, function(variable) {
          if (variable.type === "slider") {
            var sum = parseInt(section.slider.sum);
            var fraction = parseInt(variable.inputValue) / totalParts;

            variable.value = Math.round(sum * fraction * 10) / 10;
          }
        });
      },

      checkSliderSectionsValid: function() {
        var that = this;

        that.validSliders = true;

        _.forEach(this.validSliderSections, function(value) {
          if (value === false) {
            that.validSliders = false;
          }
        });
      },

      initFixedToolbar: function() {
        var that = this;

        if (window.addEventListener) {
          window.addEventListener("scroll", that.updateFixedToolbarStyle);
          window.addEventListener("touchmove", that.updateFixedToolbarStyle);
          window.addEventListener("load", that.updateFixedToolbarStyle);
        } else if (window.attachEvent) {
          window.attachEvent("onscroll", that.updateFixedToolbarStyle);
          window.attachEvent("ontouchmove", that.updateFixedToolbarStyle);
          window.attachEvent("onload", that.updateFixedToolbarStyle);
        }
        this.updateFixedToolbarStyle();
      },

      updateFixedToolbarStyle: function() {
        var top = this.getTop();

        if (top > this.navBars.topBar.clientHeight) {
          this.navBars.belowToolBar.style.paddingTop = this.navBars.toolBar.clientHeight + "px";
          this.navBars.toolBar.style.position = "fixed";
          this.navBars.toolBar.style.top = "0";
        } else {
          this.navBars.belowToolBar.style.paddingTop = "0px";
          this.navBars.toolBar.style.position = "relative";
        }
      },

      getTop: function() {
        var top = 0;

        if (typeof (window.pageYOffset) === "number") {
          top = window.pageYOffset;
        } else if (document.body && document.body.scrollTop) {
          top = document.body.scrollTop;
        } else if (document.documentElement && document.documentElement.scrollTop) {
          top = document.documentElement.scrollTop;
        }
        return top;
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
