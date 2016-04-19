>(function () {
  "use strict";
  /* global Vue, Clipboard */

  Vue.component("model-details", {
    template: "#template-model-details",
    // Show the details of one model
    data: function() {
      return {
        model: null,
        log: ""
      };
    },

    methods: {
      downloadFiles: function() {

        // Open download window
        var id = this.data.model.id;

        window.open("/scene/export?id=" + id );
      }


    }
  });
}());
