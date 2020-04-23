import _ from 'lodash'
import $ from 'jquery'

const fetchUsers = () => {
  return new Promise((resolve, reject) => {
    // Load test template data:
    $.getJSON('/api/v1/users/')
      .done((data) => {
        resolve(data)
      })
      .fail((error) => {
        reject(error)
      })
  })
}

const fetchTemplates = () => {
  return new Promise((resolve, reject) => {
    // Load test template data:
    $.getJSON('/api/v1/templates/')
      .done((data) => {
        resolve(data)
      })
      .fail((error) => {
        reject(error)
      })
  })
}

const fetchSearchTemplate = () => {
  return new Promise((resolve, reject) => {
    // Load test template data:
    $.getJSON('/api/v1/searchforms/')
      .done((data) => {
        // return the one and only search template
        // the backend returns a list but there shall only be one
        resolve(_.first(data))
      })
      .fail((error) => {
        reject(error)
      })
  })
}

const fetchVersions = () => {
  return new Promise((resolve, reject) => {
    $.getJSON('/api/v1/scenes/versions/')
      .done((data) => {
        resolve(data)
      })
      .fail((error) => {
        reject(error)
      })
  })
}

export {
  fetchUsers,
  fetchTemplates,
  fetchSearchTemplate,
  fetchVersions
}
