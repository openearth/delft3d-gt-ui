export default function update (context) {
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
}
