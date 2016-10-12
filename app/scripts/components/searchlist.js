var exports = (function () {
  "use strict";
  /* global Vue */

  // register the grid component
  var SearchList = Vue.component("search-list", {

    template: "#template-search-list",


    data: function () {
      return {
      };
    },

    props: {
      // can contain scenarios and models
      "selection": {
        type: Object,
        required: true
      },
      "models": {
        type: Object,
        required: true
      },
      "scenarios": {
        type: Object,
        required: true
      }
    },

    ready: function() {
    },
    computed: {
      scenarioList: {
        cache: false,
        get: function() {
          return _.values(this.scenarios);
        }
      },
      // Get the current selected modelid from the routing URL
      companyModels: {
        cache: false,
        get: function() {
          return _.filter(_.values(this.models), ["shared", "c"]);
        }
      },
      worldModels: {
        cache: false,
        get: function() {
          return _.filter(_.values(this.models), ["shared", "w"]);
        }
      }
    },
    methods: {
      hasCompanyModels: function () {
        return this.companyModels.length > 0;
      },
      hasWorldModels: function () {
        return this.worldModels.length > 0;
      }
    },
    events: {
    }
  });

  return {
    SearchList: SearchList
  };
}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  _.assign(window, exports);
}
