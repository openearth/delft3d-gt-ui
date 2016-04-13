/* global Vue */

// Exported globals
var ComponentModelList;

var exports = (function() {
  "use strict";

  // Constructor of our component
  ComponentModelList = function(app) {
    // Store reference to our app
    this.app = app;

    var that = this;

    // register the grid component
    Vue.component("model-list", {
      template: "#template-model-list",

      props: {
        data: Array,
        columns: Array,
        filterKey: String
      },

      computed: {
        data: {
          cache: false,
          get: function() {
            return that.app.getTemplateData().models.gridData;
          }
        },

        columns: {
          cache: false,
          get: function() {
            return that.app.getTemplateData().models.gridColumns;
          }
        },

        // Returns true if we have no items in the grid array
        hasNoModels: {
          get: function() {
            return (that.app.getTemplateData().models.gridData.length === 0);
          }
        }

      },

      data: function() {
        var templateData = that.app.getTemplateData();

        this.columns = templateData.models.gridColumns;
        this.data = templateData.models.gridData;

        if (this.columns !== undefined) {
          var sortOrders = {};

          this.columns.forEach(function(key) {
            sortOrders[key] = 1;
          });
        }

        return {
          sortKey: "",
          sortOrders: sortOrders
        };
      },

      methods: {
        sortBy: function(key) {
          this.sortKey = key;
          this.sortOrders[key] = this.sortOrders[key] * -1;
        },

        detailModel: function(rowindex) {

          var templateData = that.app.getTemplateData();

          if (templateData.models.gridData[rowindex] !== undefined) {
            // now we have access to the native event
            var id = parseInt(templateData.models.gridData[rowindex].id);

            that.app.TemplateData.selectedModel = that.app.models.findModelByID(id);
            //Test:
            templateData.selectedModelID = (id);

            templateData.currentView = "model-details";
          }
        }

      }
    });
  };

  return {
    ComponentModelList: ComponentModelList
  };

}());


// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
}
