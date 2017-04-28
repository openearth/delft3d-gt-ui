/* global Vue */
var exports = (function() {
  "use strict";

  var store = {

    state: {
      activeModelContainer: undefined,
      failedUpdate: function () {}, // If promise of updates failed, this callback will be called.
      modelContainers: [],
      models: [],
      params: [],
      reqModel: undefined,
      reqModelDetails: undefined,
      reqScenario: undefined,
      reqUser: undefined,
      scenarioContainers: [],
      scenarios: [],
      updateInterval: 4000,
      updating: false,
      user: {
        id: -1,
        /*eslint-disable camelcase*/
        first_name: "Anonymous",
        last_name: "User"
        /*eslint-enable camelcase*/
      }
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
      if(this.state.updating) {
        return;
      }

      this.state.updating = true;
      Promise.all([
        this.fetchModels(),
        this.fetchScenarios(),
        this.fetchModelDetails()
      ])
      .then((jsons) => {
        this.state.models = jsons[0];  // Array of Models
        this.state.scenarios = jsons[1];  // Array of Scenes

        this.state.models = _.map(this.state.models, (m) => {
          let modelDetails = jsons[2];  // Dictionary of Model Details

          return (m.id === modelDetails.id) ? modelDetails : m;
        });

        this.updateContainers();
        this.state.updating = false;
      })
      .catch((jqXhr) => {
        this.state.failedUpdate(jqXhr);
        this.state.updating = false;
      });
    },

    updateUser: function () {
      this.fetchUser().then((json) => {
        this.state.user = json;
      })
      .catch((jqXhr) => {
        this.state.failedUpdate(jqXhr);
        this.state.updating = false;
      });
    },

    // ================================ API FETCH CALLS

    fetchModelDetails: function () {
      if (this.state.reqModelDetails !== undefined) {
        this.state.reqModelDetails.abort();
      }

      let activeModelContainerId = _.get(this.state, "activeModelContainer.id", -1);

      if (activeModelContainerId === -1) {
        return new Promise((resolve) => {
          resolve({"id": -1});
        });
      }

      return new Promise((resolve, reject) => {
        this.state.reqModel = $.ajax({url: "/api/v1/scenes/" + activeModelContainerId + "/", data: this.state.params, traditional: true, dataType: "json"})
          .done(function(json) {
            resolve(json);
          })
          .error(function(jqXhr) {
            if (jqXhr.statusText === "NOT FOUND") {  // filters too strict
              resolve({});  // is ok: just return empty response
            }
            reject(jqXhr);
          });
      });
    },

    fetchModels: function () {
      if (this.state.reqModel !== undefined) {
        this.state.reqModel.abort();
      }
      return new Promise((resolve, reject) => {
        this.state.reqModel = $.ajax({url: "/api/v1/scenes/", data: this.state.params, traditional: true, dataType: "json"})
          .done(function(json) {
            resolve(json);
          })
          .error(function(jqXhr) {
            reject(jqXhr);
          });
      });
    },
    fetchScenarios: function () {
      if (this.state.reqScenario !== undefined) {
        this.state.reqScenario.abort();
      }
      return new Promise((resolve, reject) => {
        this.state.reqScenario = $.ajax({url: "/api/v1/scenarios/", data: this.state.params, traditional: true, dataType: "json"})
          .done(function(json) {
            resolve(json);
          })
          .error(function(jqXhr) {
            reject(jqXhr);
          });
      });
    },
    fetchUser: function () {
      if (this.state.reqUser !== undefined) {
        this.state.reqUser.abort();
      }
      return new Promise((resolve, reject) => {
        this.state.reqUser = $.ajax({url: "/api/v1/users/me/", data: this.state.params, traditional: true, dataType: "json"})
          .done(function(json) {
            resolve(json[0]);
          })
          .error(function(jqXhr) {
            reject(jqXhr);
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
          container = {
            id: model.id,
            active: false,
            selected: false,
            data: model,
            statusLevel: this.statusLevel
          };
          this.state.modelContainers.push(container);
        } else {
          // update model in container
          container.data = model;
        }
      });

      // remove containers that have no associated model
      var modelIds = _.map(this.state.models, (model) => {
        return model.id;
      });

      _.remove(this.state.modelContainers, (container) => {
        // check if should be removed
        if (_.indexOf(modelIds, container.id) === -1) {
          // if yes, check if activeModelContainer should be removed
          if(this.state.activeModelContainer !== undefined && this.state.activeModelContainer.id === container.id) {
            this.state.activeModelContainer = undefined;
          }
          return true;
        }
        return false;
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
      var scenarioIds = _.map(this.state.scenarios, (scenario) => {
        return scenario.id;
      });

      _.remove(this.state.scenarioContainers, (container) => {
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

        _.each(this.state.scenarioContainers, function (container) {
          container.models = _.without(container.models, modelContainer);
        });

        // update backend
        $.ajax({url: "/api/v1/scenes/" + modelContainer.id + "/", method: "DELETE", traditional: true, dataType: "json"})
          .done(function(data) {
            resolve(data);
          })
          .error(function(jqXhr) {
            reject(jqXhr);
          });
      });
    },

    publishModel: function (modelContainer, domain) {
      return new Promise((resolve, reject) => {
        if (modelContainer === undefined || modelContainer.id === undefined) {
          return reject("No model id to publish");
        }
        if (domain !== "company" && domain !== "world") {
          return reject("Publication level unidentified");
        }
        modelContainer.data.shared = "u";
        $.ajax({url: "/api/v1/scenes/" + modelContainer.id + "/publish_" + domain + "/", method: "POST"})
          .done(function (data) {
            resolve(data);
          })
          .error(function(jqXhr) {
            reject(jqXhr);
          });
      });
    },

    resetModel: function (modelContainer) {
      return new Promise((resolve, reject) => {
        if (modelContainer === undefined || modelContainer.id === undefined) {
          return reject("No model id to reset");
        }
        modelContainer.data.state = "New";
        $.ajax({url: "/api/v1/scenes/" + modelContainer.id + "/reset/", method: "PUT", traditional: true, dataType: "json"})
          .done(function(data) {
            resolve(data);
          })
          .error(function(jqXhr) {
            reject(jqXhr);
          });
      });
    },

    redoModel: function (modelContainer) {
      return new Promise((resolve, reject) => {
        if (modelContainer === undefined || modelContainer.id === undefined) {
          return reject("No model id to redo");
        }
        modelContainer.data.state = "Queued";
        $.ajax({url: "/api/v1/scenes/" + modelContainer.id + "/redo/", method: "PUT", traditional: true, dataType: "json"})
          .done(function(data) {
            resolve(data);
          })
          .error(function(jqXhr) {
            reject(jqXhr);
          });
      });
    },

    startModel: function (modelContainer) {
      return new Promise((resolve, reject) => {
        if (modelContainer === undefined || modelContainer.id === undefined) {
          return reject("No model id to start");
        }
        modelContainer.data.state = "Queued";
        $.ajax({url: "/api/v1/scenes/" + modelContainer.id + "/start/", method: "PUT", traditional: true, dataType: "json"})
          .done(function(data) {
            resolve(data);
          })
          .error(function(jqXhr) {
            reject(jqXhr);
          });
      });
    },

    stopModel: function (modelContainer) {
      return new Promise((resolve, reject) => {
        if (modelContainer === undefined || modelContainer.id === undefined) {
          return reject("No model id to stop");
        }
        modelContainer.data.state = "Stopping simulation";
        $.ajax({url: "/api/v1/scenes/" + modelContainer.id + "/stop/", method: "PUT", traditional: true, dataType: "json"})
          .done(function(data) {
            resolve(data);
          })
          .error(function(jqXhr) {
            reject(jqXhr);
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

        // TODO: find better solution - now we do this to trigger an update on the front-end (vm.$forceUpdate() is added in Vue 2.0)
        _.each(this.state.modelContainers, el => {
          el.selected = false;
        });

        $.ajax({url: "/api/v1/scenarios/" + scenarioContainer.id + "/", method: "DELETE", traditional: true, dataType: "json"})
          .done(function(json) {
            resolve(json);
          })
          .error(function(jqXhr) {
            reject(jqXhr);
          });
      });
    },

    createScenario: function (postdata) {

      return new Promise(function(resolve, reject) {
        $.ajax({
          url: "/api/v1/scenarios/",
          data: postdata,
          method: "POST"
        })
        .done(function() {
          resolve();
        })
        .error(function(jqXhr) {
          reject(jqXhr);
        });
      });

    },


    // ================================ OTHER SUPPORT METHODS

    statusLevel: function () {
      if (this.data.state === "Finished") {
        return "success";
      }
      if (this.data.state === "Idle: waiting for user input") {
        return "warning";
      }
      return "info";
    },

    // ================================ MULTISELECTED MODEL UPDATE METHODS

    getSelectedModels: function () {
      return _.filter(this.state.modelContainers, ["selected", true]);
    },

    resetSelectedModels: function () {
      return Promise.all(
        _.map(this.getSelectedModels(), this.resetModel.bind(this))
      );
    },

    startSelectedModels: function () {
      return Promise.all(
        _.map(this.getSelectedModels(), this.startModel.bind(this))
      );
    },

    stopSelectedModels: function () {
      return Promise.all(
        _.map(this.getSelectedModels(), this.stopModel.bind(this))
      );
    },

    deleteSelectedModels: function () {
      return Promise.all(
        _.map(this.getSelectedModels(), this.deleteModel.bind(this))
      );
    },

    shareSelectedModels: function (domain) {
      return new Promise((resolve, reject) => {

        if (this.getSelectedModels().length === 0) {
          return reject("No models to test");
        }
        if (domain !== "company" && domain !== "world") {
          return reject("Publication level unidentified");
        }

        var selectedModelsSuid = _.map(this.getSelectedModels(), function (m) {
          return m.data.suid;
        });

        $.ajax({url: "/api/v1/scenes/publish_" + domain + "_all/", method: "POST", traditional: true, dataType: "json", data: {"suid": selectedModelsSuid}})
          .done(function(data) {
            resolve(data);
          })
          .error(function(jqXhr) {
            reject(jqXhr);
          });
      });
    },

    downloadSelectedModels: function (selectedDownloads) {
      return new Promise((resolve, reject) => {
        if (this.getSelectedModels().length === 0) {
          return reject("No models to export");
        }

        var selectedModelsSuid = _.map(this.getSelectedModels(), function (m) {
          return m.data.suid;
        });

        var selectedOptions = _.reduce(selectedDownloads, function (result, value, key) {
          if (value.active) {
            result.push(key);
          }
          return result;
        }, []);

        if (selectedOptions.length === 0) {
          return reject("No downloads selected");
        }

        resolve(window.open(
            "/api/v1/scenes/export_all/?format=json&suid=" + selectedModelsSuid.join("&suid=") + "&options=" + selectedOptions.join("&options=")
        ));
      });
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
