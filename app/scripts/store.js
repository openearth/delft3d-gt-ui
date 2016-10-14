var exports = (function() {
  "use strict";

  var store = {

    state: {
      activeModelContainer: undefined,
      modelContainers: [],
      models: [],
      params: [],
      scenarioContainers: [],
      scenarios: [],
      updateInterval: 2000,
      user: {id: -1,
        /*eslint-disable camelcase*/
        first_name: "Anonymous", last_name: "User"}
        /*eslint-ensable camelcase*/
    },

    // ================================ SYNCHRONISATION

    startSync: function () {
      this.update(this);
      this.interval = setInterval(this.update.bind(this), this.state.updateInterval);
    },
    stopSync: function () {
      clearInterval(this.interval);
      this.interval = null;
    },

    update: function () {
      Promise.all([
        this.fetchModels(),
        this.fetchScenarios()
      ])
      .then((jsons) => {
        this.state.models = jsons[0];
        this.state.scenarios = jsons[1];
        this.updateContainers();
      })
      .catch(function(reason) {
        console.error("Promise rejected: " + reason);
      });
    },

    updateUser: function () {
      this.fetchUser().then((json) => {
        this.state.user = json;
      }).catch(function (reason) {
        console.error("Promise rejected: " + reason);
      });
    },

    // ================================ API FETCH CALLS

    fetchUser: function () {
      return new Promise((resolve, reject) => {
        console.log("================================================= aklsfjhalsdkfhj 1");
        $.ajax({url: "/api/v1/users/me/", data: this.state.params, traditional: true, dataType: "json"})
          .done(function(json) {
            console.log("================================================= aklsfjhalsdkfhj 2");
            resolve(json[0]);
          })
          .fail(function(error) {
            console.error("================================================= aklsfjhalsdkfhj 3 ", error);
            reject(error);
          });
      });
    },
    fetchModels: function () {
      return new Promise((resolve, reject) => {
        $.ajax({url: "/api/v1/scenes/", data: this.state.params, traditional: true, dataType: "json"})
          .done(function(json) {
            resolve(json);
          })
          .fail(function(error) {
            reject(error);
          });
      });
    },
    fetchScenarios: function () {
      return new Promise((resolve, reject) => {
        $.ajax({url: "/api/v1/scenarios/", data: this.state.params, traditional: true, dataType: "json"})
          .done(function(json) {
            resolve(json);
          })
          .fail(function(error) {
            reject(error);
          });
      });
    },

    // ================================ CONTAINER UPDATES

    updateContainers: function () {
      this.updateModelContainers();
      this.updateScenarioContainers();
    },
    updateModelContainers: function () {
      _.each(this.state.models, (model) => {
        var container = _.find(this.state.modelContainers, ["id", model.id]);

        if(container === undefined) {
          // create new container
          container = {"id": model.id, active: false, selected: false, data: model};
          this.state.modelContainers.push(container);
        } else {
          // update model in container
          container.data = model;
        }
      });

      // remove containers that have no associated model
      var modelIds = _.map(this.state.models, function (model) {
        return model.id;
      });

      _.remove(this.state.modelContainers, function(container) {
        return _.indexOf(modelIds, container.id) === -1;
      });
    },
    updateScenarioContainers: function () {
      _.each(this.state.scenarios, (scenario) => {
        var scenarioContainer = _.find(this.state.scenarioContainers, ["id", scenario.id]);

        var modelContainerSet = _.filter(this.state.modelContainers, function (o) {
          return _.includes(scenario.scene_set, o.id);
        });

        if(scenarioContainer === undefined) {
          // create new scenarioContainer
          scenarioContainer = {"id": scenario.id, data: scenario, models: modelContainerSet};
          this.state.scenarioContainers.push(scenarioContainer);
        } else {
          // update scenario in scenarioContainer
          scenarioContainer.data = scenario;
          scenarioContainer.models = modelContainerSet;
        }
      });

      // remove containers that have no associated scenario
      var scenarioIds = _.map(this.state.scenarios, function (scenario) {
        return scenario.id;
      });

      _.remove(this.state.scenarioContainers, function(container) {
        return _.indexOf(scenarioIds, container.id) === -1;
      });
    },

    // ================================ API MODELS UPDATE CALLS

    deleteModel: function (modelContainer) {
      return new Promise((resolve, reject) => {
        // snappyness: remove modelContainer from store
        if(this.state.activeModelContainer === modelContainer) {
          this.state.activeModelContainer = undefined;
        }
        this.state.modelContainers = _.without(this.state.modelContainers, modelContainer);
        _.each(this.state.scenariosContainers, function (container) {
          container.models = _.without(container.models, modelContainer);
        });

        // update backend
        $.ajax({url: "/api/v1/scenes/" + modelContainer.id + "/", method: "DELETE", traditional: true, dataType: "json"})
          .done(function(data) {
            resolve(data);
          })
          .fail(function(error) {
            reject(error);
          });
      });
    },

    publishModel: function (modelContainer, target) {
      return new Promise((resolve, reject) => {
        if (modelContainer === undefined || modelContainer.id === undefined) {
          reject("No model id to delete");
        }
        if (target === undefined) {
          reject("No publication level to publish to");
        }
        modelContainer.data.shared = "u";
        $.ajax({url: "/api/v1/scenes/" + modelContainer.id + "/publish_" + target + "/", method: "POST"})
          .done(function (data) {
            resolve(data);
          })
          .fail(function(error) {
            reject(error);
          });
      });
    },

    startModel: function (modelContainer) {
      return new Promise((resolve, reject) => {
        if (modelContainer === undefined || modelContainer.id === undefined) {
          reject("No model id to start");
        }
        modelContainer.data.state = "Queued";
        $.ajax({url: "/api/v1/scenes/" + modelContainer.id + "/start/", method: "PUT", traditional: true, dataType: "json"})
          .done(function(data) {
            resolve(data);
          })
          .fail(function(error) {
            reject(error);
          });
      });
    },

    stopModel: function (modelContainer) {
      return new Promise((resolve, reject) => {
        if (modelContainer === undefined || modelContainer.id === undefined) {
          reject("No model id to start");
        }
        modelContainer.data.state = "Stopping simulation...";
        $.ajax({url: "/api/v1/scenes/" + modelContainer.id + "/stop/", method: "PUT", traditional: true, dataType: "json"})
          .done(function(data) {
            resolve(data);
          })
          .fail(function(error) {
            reject(error);
          });
      });
    },

    // ================================ API SCENARIOS UPDATE CALLS

    deleteScenario: function (scenarioContainer) {
      return new Promise((resolve, reject) => {
        if (scenarioContainer === undefined || scenarioContainer.id === undefined) {
          reject("No scenario id to delete");
        }

        // snappyness: remove scenarioContainer from store
        this.state.scenarioContainers = _.without(this.state.scenarioContainers, scenarioContainer);
        if (_.indexOf(scenarioContainer.models, this.state.activeModelContainer) > -1) {
          this.state.activeModelContainer = undefined;
        }

        $.ajax({url: "/api/v1/scenarios/" + scenarioContainer.id + "/", method: "DELETE", traditional: true, dataType: "json"})
          .done(function(json) {
            resolve(json);
          })
          .fail(function(error) {
            reject(error);
          });
      });
    },

    // ================================ OTHER SUPPORT METHODS

    fetchLog: function (modelContainer) {
      return new Promise(function(resolve, reject) {
        if (modelContainer === undefined || modelContainer.data === undefined) {
          reject("No model to fetch log of.");
        }

        var model = modelContainer.data;

        // Working dir is at: modeldata.fileurl + delf3d + delft3d.log
        var url = model.fileurl + model.info.logfile.location + model.info.logfile.file;

        // Without a filename, we just give back a custom string.
        if (model.info.logfile.file.length === 0) {

          resolve("No log output available yet");
          return;
        }

        $.ajax(url)
          .done(function(text) {
            resolve(text);
          })
          .fail(function(error) {
            console.log("Failed to get log", error);
            reject(error);
          });

      });
    },

    // ================================ MULTISELECTED MODEL UPDATE METHODS

    getSelectedModels: function () {
      return _.filter(this.state.modelContainers, ["selected", true]);
    },

    startSelectedModels: function () {
      _.each(this.getSelectedModels(), this.startModel.bind(this));
    },

    stopSelectedModels: function () {
      _.each(this.getSelectedModels(), this.stopModel.bind(this));
    },

    deleteSelectedModels: function () {
      _.each(this.getSelectedModels(), this.deleteModel.bind(this));
    },

    // ================================ SEARCH METHODS

    updateParams: function (params) {
      this.state.params = params;
    }

  };

  // get this baby up and running:
  store.updateUser();
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
