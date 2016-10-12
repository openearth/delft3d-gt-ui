var exports = (function() {
  "use strict";

  var store = {

    state: {
      activeModelContainer: undefined,
      modelContainers: [],
      models: [],
      modelsFetched: false,
      scenarioContainers: [],
      scenarios: [],
      scenariosFetched: false,
      updateInterval: 2000,
      user: {id: -1, first_name: "Anonymous", last_name: "User"}
    },

    // ================================ SYNCHRONISATION

    startSync: function () {
      this.update(this)
      this.interval = setInterval(this.update.bind(this), this.state.updateInterval);
    },
    stopSync: function () {
      clearInterval(this.interval);
      this.interval = null;
    },

    update: function () {
      this.fetchModels().then(function (json) {
        this.state.models = json;
        this.updateContainers();
      }.bind(this)).catch(function(reason) {
        console.error('Promise rejected: ' + reason);
      });
      this.fetchScenarios().then(function (json) {
        this.state.scenarios = json;
        this.updateContainers();
      }.bind(this)).catch(function(reason) {
        console.error('Promise rejected: ' + reason);
      });
    },

    updateUser: function () {
      this.fetchUser().then(function (json) {
        this.state.user = json;
      }.bind(this)).catch(function (reason) {
        console.error('Promise rejected: ' + reason);
      });
    },

    // ================================ API FETCH CALLS

    fetchUser: function () {
      return new Promise(function(resolve, reject) {
        $.ajax({url: "/api/v1/users/me/", data: [], traditional: true, dataType: "json"})
          .done(function(json) {
            resolve(json[0]);
          }.bind(this))
          .fail(function(error) {
            reject(error);
          });
      }.bind(this));
    },
    fetchModels: function () {
      this.state.modelsFetched = false;
      return new Promise(function(resolve, reject) {
        $.ajax({url: "/api/v1/scenes/", data: [], traditional: true, dataType: "json"})
          .done(function(json) {
            this.state.modelsFetched = true;
            resolve(json);
          }.bind(this))
          .fail(function(error) {
            reject(error);
          });
      }.bind(this));
    },
    fetchScenarios: function () {
      this.state.scenariosFetched = false;
      return new Promise(function(resolve, reject) {
        $.ajax({url: "/api/v1/scenarios/", data: [], traditional: true, dataType: "json"})
          .done(function(json) {
            this.state.scenariosFetched = true;
            resolve(json);
          }.bind(this))
          .fail(function(error) {
            reject(error);
          });
      }.bind(this));
    },

    // ================================ CONTAINER UPDATES

    updateContainers: function () {
      if(!this.state.scenariosFetched || !this.state.modelsFetched) {
        return;
      }
      this.updateModelContainers();
      this.updateScenarioContainers();
    },
    updateModelContainers: function () {
      _.each(this.state.models, function (model) {
        var container = _.find(this.state.modelContainers, ['id', model.id]);
        if(container === undefined) {
          // create new container
          container = {'id': model.id, active: false, selected: false, data:model};
          this.state.modelContainers.push(container);
        } else {
          // update model in container
          container.data = model;
        }
      }.bind(this));

      // TODO: remove containers for which there are no models
    },
    updateScenarioContainers: function () {
      _.each(this.state.scenarios, function (scenario, index) {
        var scenarioContainer = _.find(this.state.scenarioContainers, ['id', scenario.id]);
        var modelContainerSet = _.filter(this.state.modelContainers, function (o) {
          return _.includes(scenario.scene_set, o.id)
        });
        if(scenarioContainer === undefined) {
          // create new scenarioContainer
          scenarioContainer = {'id': scenario.id, data:scenario, models: modelContainerSet};
          this.state.scenarioContainers.push(scenarioContainer);
        } else {
          // update scenario in scenarioContainer
          scenarioContainer.data = scenario;
          scenarioContainer.models = modelContainerSet;
        }
      }.bind(this));

      _.each(this.state.scenarioContainers, function (container) {
        if (container.models.length == 0) {
          this.deleteScenario(container);
        }
      }.bind(this));
    },

    // ================================ API MODELS UPDATE CALLS

    deleteModel: function (modelContainer) {
      // snappyness: remove modelContainer from store
      if(this.state.activeModelContainer === modelContainer) {
        this.state.activeModelContainer = undefined;
      }
      this.state.modelContainers = _.without(this.state.modelContainers, modelContainer)
      _.each(this.state.scenariosContainers, function (container) {
        container.models = _.without(container.models, modelContainer);
      });

      // update backend
      $.ajax({url: "/api/v1/scenes/" + modelContainer.id + "/", method: "DELETE", data: [], traditional: true, dataType: "json"})
        .done(function() {})
        .fail(function(error) {
          console.error(error);
        });
    },

    publishModel: function (modelContainer, target) {
      modelContainer.data.shared = 'u';
      $.ajax({url: "/api/v1/scenes/" + modelContainer.id + "/publish_" + target + "/", method: "POST"})
        .done(function () {})
        .fail(function(error) {
          console.error(error);
        });
    },

    startModel: function (modelContainer) {
      modelContainer.data.state = 'Queued';
      $.ajax({url: "/api/v1/scenes/" + modelContainer.id + "/start/", method: "PUT", data: [], traditional: true, dataType: "json"})
        .done(function() {})
        .fail(function(error) {
          console.error(error);
        });
    },

    stopModel: function (modelContainer) {
      modelContainer.data.state = 'Stopping simulation...';
      $.ajax({url: "/api/v1/scenes/" + modelContainer.id + "/stop/", method: "PUT", data: [], traditional: true, dataType: "json"})
        .done(function() {})
        .fail(function(error) {
          console.error(error);
        });
    },

    // ================================ API SCENARIOS UPDATE CALLS

    deleteScenario: function (scenarioContainer) {
      // snappyness: remove scenarioContainer from store
      this.state.scenarioContainers = _.without(this.state.scenarioContainers, scenarioContainer)
      $.ajax({url: "/api/v1/scenarios/" + scenarioContainer.id + "/", method: "DELETE", data: [], traditional: true, dataType: "json"})
        .done(function() {})
        .fail(function(error) {
          console.error(error);
        });
    },

    // ================================ OTHER SUPPORT METHODS

    fetchLog: function (modelContainer) {
      // TODO: write fetchlog
    },

    // ================================ MULTISELECTED MODEL UPDATE METHODS

    getNumSelectedModels: function () {
      return _.filter(this.state.modelContainers, ["selected", true]).length;
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
