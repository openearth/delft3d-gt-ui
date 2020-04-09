
import _ from 'lodash'
import $ from 'jquery'

export default function deleteModel (context, modelContainer) {
  console.log('deletemodel')
  return new Promise((resolve, reject) => {
    // snappyness: remove modelContainer from store
    if (context.state.activeModelContainer === modelContainer) {
      context.state.activeModelContainer = undefined
    }
    context.state.modelContainers = _.without(context.state.modelContainers, modelContainer)

    _.each(context.state.scenarioContainers, function (container) {
      container.models = _.without(container.models, modelContainer)
    })

    // update backend
    $.ajax({ url: `api/v1/scenes/${modelContainer.id}/`, method: 'DELETE', traditional: true, dataType: 'json' })
      .done(function (data) {
        resolve(data)
      })
      .fail(function (jqXhr) {
        reject(jqXhr)
      })
  })
}
