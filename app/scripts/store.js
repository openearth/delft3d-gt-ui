var exports = (function() {
  "use strict";

  var store = {

    state: {
      models: {},
      scenarios: {},
      updateInterval: 2000,
      interval: null,
      user: {id: -1}
    },

    // ================================ SYNCHRONISATION

    startSync: function () {
      this.update();
      this.state.interval = setInterval(this.update.bind(this), this.state.updateInterval);
    },
    stopSync: function () {
      clearInterval(this.state.interval);
      this.state.interval = null;
    },

    update: function () {
      this.fetchModels()
        .then((json) => {
          _.each(json, (model) => {
            if (model.id in this.state.models) {
              // recursively update
              _.merge(this.state.models[model.id], model);
            } else {
              // set and notify vue of object change
              Vue.set(this.state.models, model.id, model);
            }
          });
        })
        .catch(function(reason) {
          console.error("Promise rejected: " + reason);
        });
      this.fetchScenarios()
        .then((json) => {
          _.each(json, (scenario) => {
            if (scenario.id in this.state.scenarios) {
              // recursively update
              _.merge(this.state.scenarios[scenario.id], scenario);
            } else {
              // set and notify vue of object change
              Vue.set(this.state.scenarios, scenario.id, scenario);
            }
          });
        })
        .catch(function(reason) {
          console.error("Promise rejected: " + reason);
        });
    },

    // ================================ API FETCH CALLS

    fetchModels: function () {
      return new Promise((resolve, reject) => {
        $.ajax({url: "/api/v1/scenes/", data: [], traditional: true, dataType: "json"})
          .done((json) => {
            resolve(json);
          })
          .fail(function(error) {
            reject(error);
          });
      });
    },
    fetchScenarios: function () {
      return new Promise((resolve, reject) => {
        $.ajax({url: "/api/v1/scenarios/", data: [], traditional: true, dataType: "json"})
          .done((json) => {
            resolve(json);
          })
          .fail(function(error) {
            reject(error);
          });
      });
    },

    // ================================ API MODELS UPDATE CALLS

    deleteModel: function (model) {
      // snappyness: remove model from store
      // update backend
      $.ajax({url: "/api/v1/scenes/" + model.id + "/", method: "DELETE", data: [], traditional: true, dataType: "json"})
        .done(function() {})
        .fail(function(error) {
          console.error(error);
        });
    },

    publishModel: function (model, target) {
      model.data.shared = "u";
      $.ajax({url: "/api/v1/scenes/" + model.id + "/publish_" + target + "/", method: "POST"})
        .done(function () {})
        .fail(function(error) {
          console.error(error);
        });
    },

    startModel: function (model) {
      model.data.state = "Queued";
      $.ajax({url: "/api/v1/scenes/" + model.id + "/start/", method: "PUT", data: [], traditional: true, dataType: "json"})
        .done(function() {})
        .fail(function(error) {
          console.error(error);
        });
    },

    stopModel: function (model) {
      model.data.state = "Stopping simulation...";
      $.ajax({url: "/api/v1/scenes/" + model.id + "/stop/", method: "PUT", data: [], traditional: true, dataType: "json"})
        .done(function() {})
        .fail(function(error) {
          console.error(error);
        });
    },

    // ================================ API SCENARIOS UPDATE CALLS

    deleteScenario: function (scenario) {
      // snappyness: remove scenario from store
      $.ajax({url: "/api/v1/scenarios/" + scenario.id + "/", method: "DELETE", data: [], traditional: true, dataType: "json"})
        .done(function() {})
        .fail(function(error) {
          console.error(error);
        });
    },

    // ================================ OTHER SUPPORT METHODS

    fetchLog: function (model) {
      // TODO: write fetchlog
      console.warn("fetchlog not implemented, while trying to update model:", model);
    }

  };

  // get this baby up and running:
  store.startSync();

  return {
    store: store
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
