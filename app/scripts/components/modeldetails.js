var ModelCreate;
var ModelDetails;

(function () {
  "use strict";
  /* global Vue, Clipboard */

  ModelCreate = Vue.component("model-create", {
    template: "#template-model-create",
    // Show the details of one model
    // Doesn't have a model yet....
    data: function() {
      return {
        model: {
          name: "",
          id: 0,
          params: {

          },
          results: [],
          state: "PENDING",
          log: ""
        }
      };
    },
    methods: {
      submit: function() {
        console.log("validating", this.$data);
        console.log("submitting", JSON.stringify(this.$data));
      }
    }

  });

  ModelDetails = Vue.component("model-details", {
    template: "#template-model-details",
    // Show the details of one model
    data: function() {
      var id = this.$route.params.id;

      return {
        model: {
          id: id
        },
        log: "",
        view: {
          currentChannelNetworkFrame: 0
        }

      };
    },
    activate: function() {
      console.log("activating model details");
    },

    route: {
      data: function(transition) {
        // get model (from a service or parent)

        fetchModel(transition.to.params.id)
          .then(
            function(json) {
              // copy old data and set model
              var data = this.$data;
              data.model = json;
              // transition to this new data;
              transition.next(data);
            }.bind(this)
          );
        // data.model = {
        //   name: "fetched model info",
        //   id: transition.to.params.id,
        //   log: "logging of model: " + transition.to.params.id,
        //   state: "PENDING",
        //   results: {
        //     channelNetworkFrames: ["a.png"],
        //     deltaFringeFrames: []
        //   },
        //   params: {
        //     timestep: 13.0
        //   }
        // };

      }
    },
    methods: {
      downloadFiles: function() {

        // Open download window
        var id = this.data.model.id;

        window.open("/scene/export?id=" + id);
      },
      fetchLog: function() {
        // Working dir is at: modeldata.fileurl + delf3d + delft3d.log
        $.ajax({
          url: this.model.id + "/delft3d/delft3d.log",
          method: "GET"
        })
          .done(function(resp) {
            this.data.log = resp;
          });
      }
    }
  });
  console.log("registered model components");

}());
