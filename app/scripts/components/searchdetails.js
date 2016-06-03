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
        selectedModelEngines: []
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
      $(".ion-range").ionRangeSlider();
      $(".select-picker").selectpicker();
    },
    computed: {
    },


    methods: {
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
