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
        view: {
          currentChannelNetworkFrame: 0
        }

      };
    },
    activate: function() {
      console.log("activating details view");

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
              // and fetch log afterwards
              fetchLog(data.model.id)
                .then(log => {
                  $('#model-log-output').text(log);
                });

            }.bind(this)
          );
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
        fetchLog(this.model.id)
          .then(log => {
            // don't do this with jquery, too slow
            document.getElementById('model-log-output').textContent = log;
          })
          .catch(e => {
            $('#model-log-output').text('No log available');
          });
      }
    }
  });
  console.log("registered model components");

}());
