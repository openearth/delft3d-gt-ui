import _ from 'lodash'

export default function update (store) {
  if (store.state.updating) {
    return
  }
  store.state.updating = true
  Promise.all([
    store.dispatch('fetchModels'),
    store.dispatch('fetchScenarios'),
    store.dispatch('fetchModelDetails')
  ])
    .then((jsons) => {
      store.state.models = jsons[0] // Array of Models
      store.state.scenarios = jsons[1] // Array of Scenes

      store.state.models = _.map(store.state.models, (m) => {
        let modelDetails = jsons[2] // Dictionary of Model Details

        return (m.id === modelDetails.id) ? modelDetails : m
      })

      store.dispatch('updateContainers')
      store.state.updating = false
    })
    .catch((jqXhr) => {
      store.state.failedUpdate(jqXhr)
      store.state.updating = false
    })
}
