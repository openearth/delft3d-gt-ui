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
      "items": {
        type: Array,
        required: true
      }
    },

    ready: function() {
    },
    watch: {
      items: function() {
        this.$nextTick(function() {
        });
      }

    },
    computed: {
      // Get the current selected modelid from the routing URL
    },
    methods: {
      hasCompanyModels: function () {
        return (_.filter(this.models, ["shared", "c"]).length > 0);
      },
      hasWorldModels: function () {
        return (_.filter(this.models, ["shared", "w"]).length > 0);
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
