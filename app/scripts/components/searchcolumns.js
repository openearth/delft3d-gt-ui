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
//        models = _.uniqBy(models, "id");

        modelList.filter = "search";

        modelList.models = models;
        //modelList.models = Vue.util.extend( models, modelList.models);

//var newObject = _.extend({}, models, modelList.models);
//modelList.$set("models", models);


        this.$nextTick(function() {


          // Test, for changing arrow when using collapse
          $(".collapse").on("show.bs.collapse", function() {
            console.log("collapse");
            $(this).parent().find(".glyphicon-chevron-right").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");

          });

          $(".collapse").on("hide.bs.collapse", function() {
            console.log("show");
            $(this).parent().find(".glyphicon-chevron-down").removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-right");
          });
        });

      },

      // User clicked on a result item:
      "models-selected": function(id) {
        var modelDetails = this.getChildByName("model-details"); //this.$children[2]; //

        console.log("new details:" + id);

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
