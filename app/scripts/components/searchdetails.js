/* global _, Vue, moment, fetchSearchTemplate, fetchUsers, store  */
var exports = (function () {
  "use strict";
  var SearchDetails = Vue.component("search-details", {

    // not much in here.
    template: "#template-search-details",
    data: function() {
      return {
        activatedPostProc: {},
        createdAfter: "",
        createdBefore: "",
        searchTemplate: undefined,
        searchText: "",
        selectedDomains: [],
        selectedOutdated: [],
        selectedParameters: {},
        selectedPostProc: {},
        selectedTemplates: [],
        selectedUsers: [],
        users: []
      };
    },

    ready: function() {

      // should be initialised with values: it needs values when post processing search is activated
      this.selectedPostProc = {
        "DeltaTopD50": "0;2",
        "DeltaTopsand_fraction": "0;100",
        "DeltaTopsorting": "0;10",
        "DeltaFrontD50": "0;2",
        "DeltaFrontsand_fraction": "0;100",
        "DeltaFrontsorting": "0;10",
        "ProDeltaD50": "0;2",
        "ProDeltasand_fraction": "0;100",
        "ProDeltasorting": "0;10"
      };

      // set store failedUpdate handling
      store.state.failedUpdate = function(jqXhr) {
        console.error(jqXhr);

        let status = jqXhr.statusText || "error";
        let response = jqXhr.responseText || jqXhr.responseJson || "An error occurred.";

        this.$root.$broadcast("show-alert", {
          message: status + ": " + response, showTime: 3000, type: "danger"
        });
      }.bind(this);

      // get search templates
      Promise.all([fetchUsers(), fetchSearchTemplate()])
        .then((jsons) => {
          var users = jsons[0];
          var template = jsons[1];

          // store them
          this.users = _.sortBy(users, ["last_name", "first_name"]);
          this.searchTemplate = template;

          // after we"re done loading the templates in the dom, start searching.
          this.$nextTick(
            () => {
              // update ui
              this.initializeForm();

              // update the search results
              this.search();

              // as soon as this component is loaded we can start to sync models
              // startSyncModels();
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
      },
      createdAfterValid: {
        get: function () {
          return this.createdAfter === "" || moment(this.createdAfter, "YYYY-MM-DD", true).isValid();
        }
      },
      createdBeforeValid: {
        get: function () {
          return this.createdBefore === "" || moment(this.createdBefore, "YYYY-MM-DD", true).isValid();
        }
      }
    },

    watch: {
      activatedPostProc: function () {
        this.search();
      },
      createdAfter: function () {
        this.search();
      },
      createdBefore: function () {
        this.search();
      },
      searchTemplate: function () {
        this.search();
      },
      searchText: function () {
        this.search();
      },
      selectedDomains: function () {
        this.search();
      },
      selectedParameters: function () {
        this.search();
      },
      selectedPostProc: function () {
        this.search();
      },
      selectedTemplates: function () {
        this.search();
      },
      selectedUsers: function () {
        this.search();
      },
      selectedOutdated: function () {
        this.search();
      },
      users: function () {
        this.search();
      }
    },

    methods: {
      initializeForm: function() {
        // once the dom is updated, update the select pickers by hand
        // template data is computed into modelEngine
        var that = this;
        var pickers = $(".select-picker");

        if (pickers.selectpicker !== undefined) {
          pickers.selectpicker("refresh");
        }

        $(".datepicker").datetimepicker({
          "allowInputToggle": true,
          "format": "YYYY-MM-DD",
          "widgetPositioning": {"horizontal": "auto", "vertical": "top"},
          // widgetparent needs to be .search-columns, otherwise the date widget will overflow the column and be partially hidden
          "widgetParent": ".search-columns"
        }).on("dp.show", function () {
          // the widget doesn't render at the right position when setting .search-columns as parent, so on a show() we reposition the widget
          $(".bootstrap-datetimepicker-widget").css({
            top: $(this).offset().top - 260,
            left: $(this).offset().left
          });
        });

        // Domain selection boxes - enable all.
        $(".domain-selection-box input[type='checkbox']").prop("checked", "checked");

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
        $(".button-empty-input-field").on("click", function() {
          var input = $(this).closest(".input-group").find("input");

          // Force update selected parameters.
          // Quick fix for selected parameter, should be a parameter later.
          var id = input.attr("id");

          if (id === "search") {
            that.searchText = "";
          } else if (id === "created_before") {
            that.createdBefore = "";
          } else if (id === "created_after") {
            that.createdAfter = "";
          } else {
            that.selectedParameters[id] = "";
          }
          // Search up to the div, and then find the input child. This is the actual input field.
          that.search();
        });

        // Set event handlers for search collapsibles.
        $(".panel-search").on("show.bs.collapse", function() {
          $(this).find(".glyphicon-triangle-right").removeClass("glyphicon-triangle-right").addClass("glyphicon-triangle-bottom");
        });

        $(".panel-search").on("hide.bs.collapse", function() {
          $(this).find(".glyphicon-triangle-bottom").removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-right");
        });


      },
      buildParams: function() {
        // for now we just copy everything

        /*eslint-disable camelcase*/
        var params = {
          search: this.searchText,
          shared: this.selectedDomains,
          template: this.selectedTemplates,
          users: this.selectedUsers
        };

        if (this.selectedOutdated.length === 1) {  // filter should only be applied if one of the two options is selected
          params.outdated = this.selectedOutdated[0];
        }

        if (this.createdBeforeValid) {
          params.created_before = this.createdBefore;
        }
        if (this.createdAfterValid) {
          params.created_after = this.createdAfter;
        }
        /*eslint-enable camelcase*/

        // serialize the post-processing params
        var paramArray = _.map(
          this.selectedParameters,
          (value, key) => {
            var result = "";

            if (_.isString(value) && _.includes(value, ";")) {
              // replace ; by , =>  key,min,max
              // Breaks if someone uses ; in values (these originate from tags)
              result = key + "," + _.replace(value, ";", ",");
            } else {
              // replace ; by , =>  key,value
              result = key + "," + value;
            }

            return result;
          }
        );

        var postProcArray = _.map(
          this.selectedPostProc,
          (value, key) => {
            if (this.activatedPostProc[key]) {
              if (_.endsWith(key, "_fraction")) {
                return key + "," + _.join(_.map(_.split(value, ";"), (d) => {
                  return d / 100;
                }), ",");
              } else {
                return key + "," + _.replace(value, ";", ",");
              }
            }
            return "";
          }
        );

        _.pullAll(postProcArray, [""]);
        params.parameter = _.merge(paramArray, postProcArray);

        return params;
      },
      search: function() {
        var params = this.buildParams();

        store.updateParams(params);
        store.update();
      }
    },

    // If the clear button event is fired, perform search automatic.
    events: {
      "clearSearch": function () {
        this.createdAfter = "";
        this.createdBefore = "";
        this.searchText = "";
        this.selectedDomains = [];
        this.selectedParameters = {};
        this.selectedTemplates = [];
        this.selectedUsers = [];
        this.selectedOutdated = [];

        this.activatedPostProc = {
          "ProDeltaD50": false,
          "DeltaFrontD50": false,
          "DeltaTopD50": false,
          "ProDeltaSandFraction": false,
          "DeltaFrontSandFraction": false,
          "DeltaTopSandFraction": false,
          "ProDeltasorting": false,
          "DeltaFrontsorting": false,
          "DeltaTopsorting": false
        };

        this.selectedPostProc = {
          "ProDeltaD50": "0;1",
          "DeltaFrontD50": "0;1",
          "DeltaTopD50": "0;1",
          "ProDeltaSandFraction": "0;100",
          "DeltaFrontSandFraction": "0;100",
          "DeltaTopSandFraction": "0;100",
          "ProDeltasorting": "-10;10",
          "DeltaFrontsorting": "-10;10",
          "DeltaTopsorting": "-10;10"
        };

        this.search();
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
