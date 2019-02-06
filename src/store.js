import Vue from 'vue'
import Vuex from 'vuex'
import $ from 'jquery'
import _ from 'lodash'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    activeModelContainer: undefined,
    failedUpdate: function () { }, // If promise of updates failed, this callback will be called.
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
      /* eslint-disable camelcase */
      first_name: 'Anonymous',
      last_name: 'User'
      /* eslint-enable camelcase */
    },
    bbox: [],
    validbbox: false
  },
  mutations: {
    update (state) {
      Promise.all([
        this.commit('fetchModels'),
        this.commit('fetchScenarios'),
        this.commit('fetchModelDetails')
      ])
        .then((jsons) => {
          state.models = jsons[0] // Array of Models
          state.scenarios = jsons[1] // Array of Scenes

          state.models = _.map(state.models, (m) => {
            let modelDetails = jsons[2] // Dictionary of Model Details

            return (m.id === modelDetails.id) ? modelDetails : m
          })

          this.commit('updateContainers')
          state.updating = false
        })
        .catch((jqXhr) => {
          state.failedUpdate(jqXhr)
          state.updating = false
        })
    },
    updateParams (state, params) {
      state.params = params
    },
    fetchModels (state) {
      if (state.reqModel !== undefined) {
        state.reqModel.abort()
      }
      return new Promise((resolve, reject) => {
        state.reqModel = $.ajax({ url: '/api/v1/scenes/', data: state.params, traditional: true, dataType: 'json' })
          .done(function (json) {
            resolve(json)
          })
          .fail(function (jqXhr) {
            reject(new Error(jqXhr))
          })
      })
    },
    fetchScenarios (state) {
      if (state.reqScenario !== undefined) {
        state.reqScenario.abort()
      }
      return new Promise((resolve, reject) => {
        state.reqScenario = $.ajax({ url: '/api/v1/scenarios/', data: state.params, traditional: true, dataType: 'json' })
          .done(function (json) {
            resolve(json)
          })
          .fail(function (jqXhr) {
            reject(new Error(jqXhr))
          })
      })
    },
    fetchUser (state) {
      if (state.reqUser !== undefined) {
        state.reqUser.abort()
      }
      return new Promise((resolve, reject) => {
        state.reqUser = $.ajax({ url: '/api/v1/users/me/', data: state.params, traditional: true, dataType: 'json' })
          .done(function (json) {
            resolve(json[0])
          })
          .fail(function (jqXhr) {
            reject(new Error(jqXhr))
          })
      })
    },
    fetchModelDetails (state) {
      if (state.reqModelDetails !== undefined) {
        state.reqModelDetails.abort()
      }

      let activeModelContainerId = _.get(state, 'activeModelContainer.id', -1)

      if (activeModelContainerId === -1) {
        return new Promise((resolve) => {
          resolve({ 'id': -1 })
        })
      }

      return new Promise((resolve, reject) => {
        state.reqModel = $.ajax({ url: '/api/v1/scenes/' + activeModelContainerId + '/', data: state.params, traditional: true, dataType: 'json' })
          .done(function (json) {
            resolve(json)
          })
          .fail(function (jqXhr) {
            if (jqXhr.status === 404) { // filters too strict
              resolve({ }) // is ok: just return empty response
            }
            reject(new Error(jqXhr))
          })
      })
    },
    updateModelContainers (state) {
      _.each(state.models, (model) => {
        var container = _.find(state.modelContainers, ['id', model.id])

        if (container === undefined) {
          // create new container
          container = {
            id: model.id,
            active: false,
            selected: false,
            data: model,
            statusLevel: this.statusLevel
          }
          state.modelContainers.push(container)
        } else {
          // update model in container
          container.data = model
        }
      })

      // remove containers that have no associated model
      var modelIds = _.map(state.models, (model) => {
        return model.id
      })

      _.remove(state.modelContainers, (container) => {
        // check if should be removed
        if (_.indexOf(modelIds, container.id) === -1) {
          // if yes, check if activeModelContainer should be removed
          if (state.activeModelContainer !== undefined && state.activeModelContainer.id === container.id) {
            state.activeModelContainer = undefined
          }
          return true
        }
        return false
      })
    },
    updateScenarioContainers (state) {
      _.each(state.scenarios, (scenario) => {
        var scenarioContainer = _.find(state.scenarioContainers, ['id', scenario.id])

        var modelContainerSet = _.filter(state.modelContainers, function (o) {
          return _.includes(scenario.scene_set, o.id)
        })

        if (scenarioContainer === undefined) {
          // create new scenarioContainer
          scenarioContainer = { 'id': scenario.id, data: scenario, models: modelContainerSet }
          state.scenarioContainers.push(scenarioContainer)
        } else {
          // update scenario in scenarioContainer
          scenarioContainer.data = scenario
          scenarioContainer.models = modelContainerSet
        }
      })

      // remove containers that have no associated scenario
      var scenarioIds = _.map(state.scenarios, (scenario) => {
        return scenario.id
      })

      _.remove(state.scenarioContainers, (container) => {
        return _.indexOf(scenarioIds, container.id) === -1
      })
    },
    updateContainers (state) {
      this.commit('updateModelContainers')
      this.commit('updateScenarioContainers')
    },
    publishModel (state, payload) {
      return new Promise((resolve, reject) => {
        if (payload.modelContainer === undefined || payload.modelContainer.id === undefined) {
          return reject(new Error('No model id to publish'))
        }
        if (payload.domain !== 'company' && payload.domain !== 'world') {
          return reject(new Error('Publication level unidentified'))
        }
        payload.modelContainer.data.shared = 'u'
        $.ajax({ url: '/api/v1/scenes/' + payload.modelContainer.id + '/publish_' + payload.domain + '/', method: 'POST' })
          .done(function (data) {
            resolve(data)
          })
          .fail(function (jqXhr) {
            reject(new Error(jqXhr))
          })
      })
    },
    redoModel (state, payload) {
      var body = { 'entrypoint': payload.entrypoint }

      return new Promise((resolve, reject) => {
        if (payload.modelContainer === undefined || payload.modelContainer.id === undefined) {
          return reject(new Error('No model id to redo'))
        }
        payload.modelContainer.data.state = 'Queued'
        $.ajax({ url: '/api/v1/scenes/' + payload.modelContainer.id + '/redo/', method: 'PUT', traditional: true, dataType: 'json', data: body })
          .done(function (data) {
            resolve(data)
          })
          .fail(function (jqXhr) {
            reject(new Error(jqXhr))
          })
      })
    },

    startModel (state, modelContainer) {
      return new Promise((resolve, reject) => {
        if (modelContainer === undefined || modelContainer.id === undefined) {
          return reject(new Error('No model id to start'))
        }
        modelContainer.data.state = 'Queued'
        $.ajax({ url: '/api/v1/scenes/' + modelContainer.id + '/start/', method: 'PUT', traditional: true, dataType: 'json' })
          .done(function (data) {
            resolve(data)
          })
          .fail(function (jqXhr) {
            reject(new Error(jqXhr))
          })
      })
    },

    stopModel (state, modelContainer) {
      return new Promise((resolve, reject) => {
        if (modelContainer === undefined || modelContainer.id === undefined) {
          return reject(new Error('No model id to stop'))
        }
        modelContainer.data.state = 'Stopping simulation'
        $.ajax({ url: '/api/v1/scenes/' + modelContainer.id + '/stop/', method: 'PUT', traditional: true, dataType: 'json' })
          .done(function (data) {
            resolve(data)
          })
          .fail(function (jqXhr) {
            reject(new Error(jqXhr))
          })
      })
    },
    deleteModel (state, modelContainer) {
      return new Promise((resolve, reject) => {
        // snappyness: remove modelContainer from store
        if (state.activeModelContainer === modelContainer) {
          state.activeModelContainer = undefined
        }
        state.modelContainers = _.without(state.modelContainers, modelContainer)

        _.each(state.scenarioContainers, function (container) {
          container.models = _.without(container.models, modelContainer)
        })

        // update backend
        $.ajax({ url: '/api/v1/scenes/' + modelContainer.id + '/', method: 'DELETE', traditional: true, dataType: 'json' })
          .done(function (data) {
            resolve(data)
          })
          .fail(function (jqXhr) {
            reject(new Error(jqXhr))
          })
      })
    }
  },

  actions: {

  }
})
