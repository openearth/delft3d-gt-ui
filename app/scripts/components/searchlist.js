var exports = (function () {
  "use strict";
  /* global Vue */

  // register the grid component
  var SearchList = Vue.component("search-list", {

    template: "#template-search-list",
    props: {

      // can contain scenarios and models
      "items": {
        type: Array,
        required: true
      }
    },

    data: function() {
      return {
      };
    },
    ready: function() {
      this.$on("models-loaded", function(models) {
        console.log("models loaded", models);
      });

    },
    watch: {
      items: function() {
        this.$nextTick(function() {
        });
      }

    },
    computed: {

      // Get the current selected modelid from the routing URL
      selectedModel: {
        cache: false,
        get: function() {
          var models = _.filter(this.selectedItems, ['type', 'model']);
          var firstModel = _.first(models);

          return firstModel;
        }
      },
      selectedItems: {
        cache: false,
        get: function() {
          // we have models in scenarios
          var models = _.flatMap(this.items, 'models');
          // combine them with scenarios and orphans
          var allItems = _.concat(models, this.items);
          // we only want the active ones
          var activeItems = _.filter(allItems, ['active', true]);

          return activeItems;
        }
      }



    },

    methods: {
      toggleItem: function(item, evt) {
        if (item.type === 'scenario') {
          _.each(item.models, function(model) {
            model.active = !item.active;
          });
        };
        item.active = !item.active;
      }
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
