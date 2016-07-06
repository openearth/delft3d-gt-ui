/* global Vue, SearchDetails, SearchList, ModelDetails */

var exports = (function () {
  "use strict";
  // Our homepage component
  var SearchColumns = Vue.component("search-columns", {
    // not much in here.
    template: "#template-search-columns",
    data: function() {
      return {
      };
    },
    components: {
      "search-details": SearchDetails,
      "search-list": SearchList,
      "model-details": ModelDetails
    },


    methods: {

      // Get a child by name, such that we do not have a fixed index.
      getChildByName: function(name) {
        var that = this;

        for(var i = 0; i < that.$children.length; i++) {

          // Check if name matches:
          if (that.$children[i].$options.name === name) {
            return that.$children[i];
          }
        }

        return null;
      }

    },
    events: {

      // Got some search results:
      "models-found": function (models) {
        var modelList = this.$refs.models;

        // Remove items which have double id's.
        // Otherwise we get multiple runs in the list which share the same scenario.
        models = _.uniqBy(models, "id");

        modelList.filter = "search";
        modelList.models = models;

        // Test, for changing arrow when using collapse
        $('.collapse').on('show.bs.collapse', function(){
          $(this).parent().find(".glyphicon-chevron-down").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up")

        }).on('hide.bs.collapse', function(){
         $(this).parent().find(".glyphicon-chevron-up").removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
        });

      },

      // User clicked on a result item:
      "models-selected": function(id) {
        var modelDetails = this.getChildByName("model-details"); //this.$children[2]; //

        modelDetails.id = id;

      }
    }
  });

  return {
    SearchColumns: SearchColumns
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
