/* global Vue */

var exports = (function () {
  "use strict";
  // Our homepage component
  var SearchDetails = Vue.component("search-details", {
    // not much in here.
    template: "#template-search-details",
    data: function() {
      return {
        selectedTemplates: [],
        selectedModelEngines: [],
        parameters: {
          "river-width": null,
          "river-discharge": null
        },
        audience: {
          "private": true
        },
        startDate: null,
        endDate: null,
        text: ""

      };
    },
    props: {
      templates: {
        default: function () {
          return [
            {
              name: "Template A"
            },
            {
              name: "Template B"
            }
          ];
        }
      },
      modelEngines: {
        default: function () {
          return [
            {
              name: "Delft3D Curvilinear"
            },
            {
              name: "Delft3D Flexible Mesh"
            }
          ];
        }
      }
    },

    ready: function() {
      $(".ion-range").ionRangeSlider({
        onFinish: (data) => {
          this.search();
        }
      });

      $(".select-picker").selectpicker();
    },
    computed: {
    },


    methods: {
      buildRequest: function() {
        // for now we just copy everything

        var params = {
          name: this.name,
          state: this.state,
          scenario: this.scenario,
          template: this.selectedTemplates,
        };

        _.forEach(this.parameters, function(value, key) {
          if (value.includes(";")) {
            params[key] = value.split(";");
          }

        });

        return {
          url: "/api/v1/scenes/",
          data: params,
          dataType: "json"
        };
      },
      search: function() {
        $.ajax(this.buildRequest())
          .then(function(data){
            console.log("data", data);
          })
          .fail(function(err){
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
