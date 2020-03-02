import Vue from 'vue'
import Vuex from 'vuex'
import $ from 'jquery'
import _ from 'lodash'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    activeModelContainer: undefined,
    failedUpdate: () => { }, // If promise of updates failed, this callback will be called.
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
  },
  actions: {

    // ================================ SYNCHRONISATION
    fetchUser (context) {
      if (context.state.reqUser !== undefined) {
        context.state.reqUser.abort()
      }
      return new Promise((resolve, reject) => {
        context.state.user = $.ajax({ url: 'api/v1/users/me/', data: context.state.params, traditional: true, dataType: 'json' })
          .done(function (json) {
            console.log('fetchuser worked', json)
            resolve(json[0])
          })
          .fail(function (jqXhr) {
            reject(jqXhr)
          })
      })
    },

    startSync (store) {
      // var x = 0
      // var intervalID = setInterval(() => {
      //   store.dispatch('update')
      //   // Your logic here
      //
      //   if (++x === 5) {
      //     window.clearInterval(intervalID)
      //   }
      // }, )
      console.log('startSync, checking updateInterval', store.state.updateInterval)
      store.interval = setInterval(() => { store.dispatch('update') }, store.state.updateInterval)
    },

    stopSync (store) {
      clearInterval(store.interval)
      store.interval = null
    },
    update (context) {
     if (context.state.updating) {
       return
     }
     context.state.updating = true
     Promise.all([
       context.dispatch('fetchModels'),
       context.dispatch('fetchScenarios'),
       context.dispatch('fetchModelDetails')
     ])
       .then((jsons) => {
         context.state.models = jsons[0] // Array of Models
         context.state.scenarios = jsons[1] // Array of Scenes

         context.state.models = _.map(context.state.models, (m) => {
           let modelDetails = jsons[2] // Dictionary of Model Details
           return (m.id === modelDetails.id) ? modelDetails : m
         })

         context.dispatch('updateContainers')
         context.state.updating = false
       })
       .catch((jqXhr) => {
         context.state.failedUpdate(jqXhr)
         context.state.updating = false
       })
   },
   updateUser (store) {
     store.dispatch('fetchUser').then((json) => {
       console.log('updateuser', json)
       store.state.user = json
     })
       .catch((jqXhr) => {
         store.state.failedUpdate(jqXhr)
         store.state.updating = false
       })
   },




    // ================================ API FETCH CALLS
    fetchModelDetails (context) {
      if (this.state.reqModelDetails !== undefined) {
        this.state.reqModelDetails.abort()
      }

      let activeModelContainerId = _.get(this.state, 'activeModelContainer.id', -1)

      if (activeModelContainerId === -1) {
        return new Promise((resolve) => {
          resolve({ 'id': -1 })
        })
      }
      return new Promise((resolve, reject) => {
        this.state.reqModel = $.ajax({ url: 'api/v1/scenes/' + activeModelContainerId + '/', data: this.state.params, traditional: true, dataType: 'json' })
          .done(function (json) {
            resolve(json)
          })
          .fail(function (jqXhr) {
            if (jqXhr.status === 404) { // filters too strict
              resolve({ }) // is ok: just return empty response
            }
            reject(jqXhr)
          })
      })
    },

    fetchModels (context) {
      if (this.state.reqModel !== undefined) {
        this.state.reqModel.abort()
      }
      return new Promise((resolve, reject) => {
        this.state.reqModel = $.ajax({ url: '/api/v1/scenes/', data: this.state.params, traditional: true, dataType: 'json' })
          .done(function (json) {
            resolve(json)
          })
          .fail(function (jqXhr) {
            reject(jqXhr)
          })
      })
    },
    fetchScenarios (context) {
      if (this.state.reqScenario !== undefined) {
        this.state.reqScenario.abort()
      }
      return new Promise((resolve, reject) => {
        this.state.reqScenario = $.ajax({ url: 'api/v1/scenarios/', data: this.state.params, traditional: true, dataType: 'json' })
          .done(function (json) {
            console.log('Succes fetchScenarios')
            resolve(json)
          })
          .fail(function (jqXhr) {
            reject(jqXhr)
          })
      })
    },

    // ================================ CONTAINER UPDATES

    updateContainers (context) {
      this.dispatch('updateModelContainers')
      this.dispatch('updateScenarioContainers')
    },

    updateModelContainers (context) {
      _.each(this.state.models, (model) => {
        var container = _.find(this.state.modelContainers, ['id', model.id])
        if (container === undefined) {
          // create new container
          container = {
            id: model.id,
            active: false,
            selected: false,
            data: model,
            statusLevel: model.state
          }
          this.state.modelContainers.push(container)
        } else {
          // update model in container
          container.data = model
        }
      })

      // remove containers that have no associated model
      var modelIds = _.map(this.state.models, (model) => {
        return model.id
      })

      _.remove(this.state.modelContainers, (container) => {
        // check if should be removed
        if (_.indexOf(modelIds, container.id) === -1) {
          // if yes, check if activeModelContainer should be removed
          if (this.state.activeModelContainer !== undefined && this.state.activeModelContainer.id === container.id) {
            this.state.activeModelContainer = undefined
          }
          return true
        }
        return false
      })
    },
    updateScenarioContainers (context) {
      _.each(this.state.scenarios, (scenario) => {
        var scenarioContainer = _.find(this.state.scenarioContainers, ['id', scenario.id])

        var modelContainerSet = _.filter(this.state.modelContainers, function (o) {
          return _.includes(scenario.scene_set, o.id)
        })

        if (scenarioContainer === undefined) {
          // create new scenarioContainer
          scenarioContainer = { 'id': scenario.id, data: scenario, models: modelContainerSet }
          this.state.scenarioContainers.push(scenarioContainer)
        } else {
          // update scenario in scenarioContainer
          scenarioContainer.data = scenario
          scenarioContainer.models = modelContainerSet
        }
      })

      // remove containers that have no associated scenario
      var scenarioIds = _.map(this.state.scenarios, (scenario) => {
        return scenario.id
      })

      _.remove(this.state.scenarioContainers, (container) => {
        return _.indexOf(scenarioIds, container.id) === -1
      })
    },

    // ================================ API MODELS UPDATE CALLS

    deleteModel (context, payload) {
      const { modelContainer } = payload
      return new Promise((resolve, reject) => {
        // snappyness: remove modelContainer from store
        if (this.state.activeModelContainer === modelContainer) {
          this.state.activeModelContainer = undefined
        }
        this.state.modelContainers = _.without(this.state.modelContainers, modelContainer)

        _.each(this.state.scenarioContainers, function (container) {
          container.models = _.without(container.models, modelContainer)
        })

        // update backend
        $.ajax({ url: 'api/v1/scenes/' + modelContainer.id + '/', method: 'DELETE', traditional: true, dataType: 'json' })
          .done(function (data) {
            resolve(data)
          })
          .fail(function (jqXhr) {
            reject(jqXhr)
          })
      })
    },
    publishModel (context, payload) {

      return new Promise((resolve, reject) => {
        if (payload.modelContainer === undefined || payload.modelContainer.id === undefined) {
          return reject(new Error('No model id to publish'))
        }
        if (payload.domain !== 'company' && payload.domain !== 'world') {
          return reject(new Error('Publication level unidentified'))
        }
        payload.modelContainer.data.shared = 'u'
        $.ajax({ url: 'api/v1/scenes/' + payload.modelContainer.id + '/publish_' + payload.domain + '/', method: 'POST' })
          .done(function (data) {
            resolve(data)
          })
          .fail(function (jqXhr) {
            reject(jqXhr)
          })
      })
    },
    resetModel (context, payload) {
      const { modelContainer } = payload
      return new Promise((resolve, reject) => {
        if (modelContainer === undefined || modelContainer.id === undefined) {
          return reject(new Error('No model id to reset'))
        }
        modelContainer.data.state = 'New'
        $.ajax({ url: 'api/v1/scenes/' + modelContainer.id + '/reset/', method: 'PUT', traditional: true, dataType: 'json' })
          .done(function (data) {
            resolve(data)
          })
          .fail(function (jqXhr) {
            console.log('Error resetModel', jqXhr.statusText)
            reject(jqXhr)
          })
      })
    },
    redoModel (context, payload) {
      var body = { 'entrypoint': payload.entrypoint }

      return new Promise((resolve, reject) => {
        if (payload.modelContainer === undefined || payload.modelContainer.id === undefined) {
          return reject(new Error('No model id to redo'))
        }
        payload.modelContainer.data.state = 'Queued'
        $.ajax({ url: 'api/v1/scenes/' + payload.modelContainer.id + '/redo/', method: 'PUT', traditional: true, dataType: 'json', data: body })
          .done(function (data) {
            resolve(data)
          })
          .fail(function (jqXhr) {
            console.log(jqXhr.statusText)
            reject(jqXhr)
          })
      })
    },
    startModel (context, modelContainer) {
      return new Promise((resolve, reject) => {
        if (modelContainer === undefined || modelContainer.id === undefined) {
          return reject(new Error('No model id to start'))
        }
        modelContainer.data.state = 'Queued'
        $.ajax({ url: 'api/v1/scenes/' + modelContainer.id + '/start/', method: 'PUT', traditional: true, dataType: 'json' })
          .done(function (data) {
            resolve(data)
          })
          .fail(function (jqXhr) {
            console.log('Error startModel', jqXhr.statusText)
            reject(jqXhr)
          })
      })
    },

    stopModel (context, modelContainer) {
      return new Promise((resolve, reject) => {
        if (modelContainer === undefined || modelContainer.id === undefined) {
          return reject(new Error('No model id to stop'))
        }
        modelContainer.data.state = 'Stopping simulation'
        $.ajax({ url: 'api/v1/scenes/' + modelContainer.id + '/stop/', method: 'PUT', traditional: true, dataType: 'json' })
          .done(function (data) {
            resolve(data)
          })
          .fail(function (jqXhr) {
            console.log(jqXhr.statusText)
            reject(jqXhr)
          })
      })
    },

    // ================================ API SCENARIOS UPDATE CALLS

    deleteScenario (context, scenarioContainer) {
      return new Promise((resolve, reject) => {
        if (scenarioContainer === undefined || scenarioContainer.id === undefined) {
          reject(new Error('No scenario id to delete'))
        }

        // snappyness: remove scenarioContainer from store
        this.state.scenarioContainers = _.without(this.state.scenarioContainers, scenarioContainer)
        if (_.indexOf(scenarioContainer.models, this.state.activeModelContainer) > -1) {
          this.state.activeModelContainer = undefined
        }

        // TODO: find better solution - now we do this to trigger an update on the front-end (vm.$forceUpdate() is added in Vue 2.0)
        _.each(this.state.modelContainers, el => {
          el.selected = false
        })

        $.ajax({ url: 'api/v1/scenarios/' + scenarioContainer.id + '/', method: 'DELETE', traditional: true, dataType: 'json' })
          .done(function (json) {
            resolve(json)
          })
          .fail(function (jqXhr) {
            console.log('Error deleteScenario', jqXhr.statusText)
            reject(jqXhr)
          })
      })
    },

    createScenario (context, postdata) {
      return new Promise(function (resolve, reject) {
        $.ajax({
          url: 'api/v1/scenarios/',
          data: postdata,
          method: 'POST'
        })
          .done(function () {
            resolve()
          })
          .fail(function (jqXhr) {
            console.log('Error reateScenario', jqXhr.statusText)
          })
      })
    },

    // ================================ OTHER SUPPORT METHODS

    statusLevel (context) {
      if (this.data.state === 'Finished') {
        return 'success'
      }
      if (this.data.state === 'Idle: waiting for user input') {
        return 'warning'
      }
      return 'info'
    },
    // ================================ MULTISELECTED MODEL UPDATE METHODS

        resetSelectedModels (state) {
          return Promise.all(
            _.map(state.getSelectedModels, state.resetModel)
          );
        },

        startSelectedModels (state) {
          return Promise.all(
            _.map(state.getSelectedModels, state.startModel)
          );
        },

        stopSelectedModels (state) {
          return Promise.all(
            _.map(state.getSelectedModels, state.sdtopModel)
          );
        },

        redoSelectedModels (state) {
          return Promise.all(
            _.map(state.getSelectedModels, state.redoModel)
          );
        },

        deleteSelectedModels (state) {
          return Promise.all(
            _.map(state.getSelectedModels, state.deleteModel)
          );
        },

    shareSelectedModels (context, domain) {
      return new Promise((resolve, reject) => {
        if (this.getSelectedModels().length === 0) {
          return reject(new Error('No models to test'))
        }
        if (domain !== 'company' && domain !== 'world') {
          return reject(new Error('Publication level unidentified'))
        }

        var selectedModelsSuid = _.map(this.getSelectedModels(), function (m) {
          return m.data.suid
        })

        $.ajax({ url: 'api/v1/scenes/publish_' + domain + '_all/', method: 'POST', traditional: true, dataType: 'json', data: { 'suid': selectedModelsSuid } })
          .done(function (data) {
            resolve(data)
          })
          .fail(function (jqXhr) {
            reject(jqXhr)
          })
      })
    },

    downloadSelectedModels (context, selectedDownloads) {
      return new Promise((resolve, reject) => {
        if (this.dispatch('getSelectedModels').length === 0) {
          return reject(new Error('No models to export'))
        }

        var selectedModelsSuid = _.map(this.dispatch('getSelectedModels'), function (m) {
          return m.data.suid
        })

        var selectedOptions = _.reduce(selectedDownloads, function (result, value, key) {
          if (value.active) {
            result.push(key)
          }
          return result
        }, [])

        if (selectedOptions.length === 0) {
          return reject(new Error('No downloads selected'))
        }

        resolve(window.open(
          'api/v1/scenes/export_all/?format=json&suid=' + selectedModelsSuid.join('&suid=') + '&options=' + selectedOptions.join('&options=')
        ))
      })
    },

    // ================================ SEARCH METHODS

    updateParams (context, params) {
      this.state.params = params
    },

    setbbox (context, bbox) {
      this.state.bbox = bbox
    },
    setbboxvalidation (context, val) {
      this.state.validbbox = val
    }

  },
  getters: {
    getSelectedModels (state, context) {
      return _.filter(state.modelContainers, ['selected', true])
    },
  }

})
