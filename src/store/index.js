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
    fetchUser () {
      if (this.state.reqUser !== undefined) {
        this.state.reqUser.abort()
      }
      return new Promise((resolve, reject) => {
        this.state.user = $.ajax({ url: '/api/v1/users/me/', data: this.state.params, traditional: true, dataType: 'json' })
          .done((json) => {
            resolve(json[0])
          })
          .fail((jqXhr) => {
            window.location.href = 'login/'
            reject(jqXhr)
          })
      })
    },

    startSync (store) {
      store.interval = setInterval(() => { store.dispatch('update') }, store.state.updateInterval)
    },

    stopSync (store) {
      clearInterval(store.interval)
      store.interval = null
    },
    updateUser () {
      this.dispatch('fetchUser').then((json) => {
        this.state.user = json
      })
        .catch((jqXhr) => {
          this.state.failedUpdate(jqXhr)
          this.state.updating = false
        })
    },

    // ================================ API FETCH CALLS

    update () {
      if (this.state.updating) {
        return
      }

      this.state.updating = true
      Promise.all([
        this.dispatch('fetchModels'),
        this.dispatch('fetchScenarios'),
        this.dispatch('fetchModelDetails')
      ])
        .then((jsons) => {
          this.state.models = jsons[0] // Array of Models
          this.state.scenarios = jsons[1] // Array of Scenes

          this.state.models = _.map(this.state.models, (m) => {
            const modelDetails = jsons[2] // Dictionary of Model Details
            return (m.id === modelDetails.id) ? modelDetails : m
          })

          this.dispatch('updateContainers')
          this.state.updating = false
        })
        .catch((jqXhr) => {
          this.state.failedUpdate(jqXhr)
          this.state.updating = false
        })
    },

    fetchModelDetails (context) {
      if (this.state.reqModelDetails !== undefined) {
        this.state.reqModelDetails.abort()
      }

      const activeModelContainerId = _.get(this.state, 'activeModelContainer.id', -1)

      if (activeModelContainerId === -1) {
        return new Promise((resolve) => {
          resolve({ id: -1 })
        })
      }
      return new Promise((resolve, reject) => {
        this.state.reqModel = $.ajax({ url: '/api/v1/scenes/' + activeModelContainerId + '/', data: this.state.params, traditional: true, dataType: 'json' })
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
        this.state.reqScenario = $.ajax({ url: '/api/v1/scenarios/', data: this.state.params, traditional: true, dataType: 'json' })
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

    updateContainers () {
      this.dispatch('updateModelContainers')
      this.dispatch('updateScenarioContainers')
    },

    updateModelContainers () {
      _.each(this.state.models, (model) => {
        let container = _.find(this.state.modelContainers, ['id', model.id])
        if (container === undefined) {
          // create new container
          container = {
            id: model.id,
            active: false,
            selected: false,
            data: model,
            state: model.state
          }
          this.state.modelContainers.push(container)
        } else {
          // update model in container
          container.data = model
        }
        let statusLevel = 'info'

        if (model.state === 'Finished') {
          statusLevel = 'success'
        } else if (model.state === 'Idle: waiting for user input') {
          statusLevel = 'warning'
        } else if (model.state === 'Running simulation') {
          statusLevel = 'striped active'
        }
        container.statusLevel = statusLevel
      })

      // remove containers that have no associated model
      const modelIds = _.map(this.state.models, (model) => {
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
    updateScenarioContainers () {
      _.each(this.state.scenarios, (scenario) => {
        let scenarioContainer = _.find(this.state.scenarioContainers, ['id', scenario.id])

        const modelContainerSet = _.filter(this.state.modelContainers, (o) => {
          return _.includes(scenario.scene_set, o.id)
        })

        if (scenarioContainer === undefined) {
          // create new scenarioContainer
          scenarioContainer = { id: scenario.id, data: scenario, models: modelContainerSet }
          this.state.scenarioContainers.push(scenarioContainer)
        } else {
          // update scenario in scenarioContainer
          scenarioContainer.data = scenario
          scenarioContainer.models = modelContainerSet
        }
      })

      // remove containers that have no associated scenario
      const scenarioIds = _.map(this.state.scenarios, (scenario) => {
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
        _.each(this.state.scenarioContainers, (container) => {
          container.models = _.without(container.models, modelContainer)
        })
        // update backend
        $.ajax({ url: `/api/v1/scenes/${_.get(modelContainer, 'id')}/`, method: 'DELETE', traditional: true, dataType: 'json' })
          .done((data) => {
            resolve(data)
          })
          .fail((jqXhr) => {
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
        $.ajax({ url: '/api/v1/scenes/' + payload.modelContainer.id + '/publish_' + payload.domain + '/', method: 'POST' })
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
        $.ajax({ url: '/api/v1/scenes/' + modelContainer.id + '/reset/', method: 'PUT', traditional: true, dataType: 'json' })
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
      const body = { entrypoint: payload.entrypoint }

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
        $.ajax({ url: '/api/v1/scenes/' + modelContainer.id + '/start/', method: 'PUT', traditional: true, dataType: 'json' })
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
        $.ajax({ url: '/api/v1/scenes/' + modelContainer.id + '/stop/', method: 'PUT', traditional: true, dataType: 'json' })
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
        if (scenarioContainer === undefined || _.get(scenarioContainer, 'id') === undefined) {
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

        $.ajax({ url: '/api/v1/scenarios/' + scenarioContainer.id + '/', method: 'DELETE', traditional: true, dataType: 'json' })
          .done((json) => {
            resolve(json)
          })
          .fail((jqXhr) => {
            console.log('Error deleteScenario', jqXhr.statusText)
            reject(jqXhr)
          })
      })
    },

    createScenario (context, postdata) {
      return $.ajax({
        url: '/api/v1/scenarios/',
        data: postdata,
        method: 'POST'
      })
    },
    // ================================ MULTISELECTED MODEL UPDATE METHODS

    resetSelectedModels () {
      return Promise.all(
        _.map(this.getters.getSelectedModels, (pl) => this.dispatch('resetModel', pl))
      )
    },

    startSelectedModels () {
      return Promise.all(
        _.map(this.getters.getSelectedModels, (pl) => this.dispatch('startModel', pl))
      )
    },

    stopSelectedModels () {
      return Promise.all(
        _.map(this.getters.getSelectedModels, (pl) => this.dispatch('stopModel', pl))
      )
    },

    redoSelectedModels () {
      return Promise.all(
        _.map(this.getters.getSelectedModels, (pl) => this.dispatch('redoModel', pl))
      )
    },

    deleteSelectedModels () {
      return Promise.all(
        _.map(this.getters.getSelectedModels, (pl) => this.dispatch('deleteModel', pl))
      )
    },

    shareSelectedModels (context, domain) {
      return new Promise((resolve, reject) => {
        if (this.getters.getSelectedModels.length === 0) {
          return reject(new Error('No models to test'))
        }
        if (domain !== 'company' && domain !== 'world') {
          return reject(new Error('Publication level unidentified'))
        }

        const selectedModelsSuid = _.map(this.getters.getSelectedModels, (m) => {
          return m.data.suid
        })

        $.ajax({ url: '/api/v1/scenes/publish_' + domain + '_all/', method: 'POST', traditional: true, dataType: 'json', data: { suid: selectedModelsSuid } })
          .done(function (data) {
            resolve(data)
          })
          .fail(function (jqXhr) {
            reject(jqXhr)
          })
      })
        .catch(e => console.log(e))
    },

    downloadSelectedModels (context, selectedDownloads) {
      return new Promise((resolve, reject) => {
        if (this.getters.getSelectedModels.length === 0) {
          return reject(new Error('No models to export'))
        }

        const selectedModelsSuid = _.map(this.getters.getSelectedModels, (m) => {
          return m.data.suid
        })

        const selectedOptions = _.reduce(selectedDownloads, (result, value, key) => {
          if (value.active) {
            result.push(key)
          }
          return result
        }, [])

        if (selectedOptions.length === 0) {
          return reject(new Error('No downloads selected'))
        }

        resolve(window.open(
          '/api/v1/scenes/export_all/?format=json&suid=' + selectedModelsSuid.join('&suid=') + '&options=' + selectedOptions.join('&options=')
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
    getSelectedModels: (state) => {
      return _.filter(state.modelContainers, ['selected', true])
    }
  }

})
