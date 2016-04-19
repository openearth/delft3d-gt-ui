(function () {
  "use strict";
  /* global Vue, Clipboard */

  Vue.component("model-create", {
    template: "#template-model-create",
    // Show the details of one model
    // Doesn't have a model yet....
    data: function() {
      return {
        name: "Model name",
        timestep: 13.0
      };
    },
    methods: {
      submit: function() {
        console.log("validating", this.$data);
        console.log("submitting", this);
      }
    }

  });

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
      },
      fetchLog: function() {
        // Working dir is at: modeldata.fileurl + delf3d + delft3d.log
        $.ajax({
          url: this.model.id + "/delft3d/delft3d.log",
          method: "GET"
        })
          .done(function(resp){
            this.data.log = resp;
          });
      }
    }
  });
  console.log("registered model components");

}());
