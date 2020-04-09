import _ from 'lodash'
import $ from 'jquery'

function fetchUsers () {
  return new Promise(function (resolve, reject) {
    // Load test template data:
    $.getJSON('/api/v1/users/')
      .done(function (data) {
        resolve(data)
      })
      .fail(function (error) {
        reject(error)
      })
  })
}

function fetchTemplates () {
  return new Promise(function (resolve, reject) {
    // Load test template data:
    $.getJSON('/api/v1/templates/')
      .done(function (data) {
        resolve(data)
      })
      .fail(function (error) {
        reject(error)
      })
  })
}

function fetchSearchTemplate () {
  return new Promise(function (resolve, reject) {
    // Load test template data:
    $.getJSON('/api/v1/searchforms/')
      .done(function (data) {
        // return the one and only search template
        // the backend returns a list but there shall only be one
        resolve(_.first(data))
      })
      .fail(function (error) {
        reject(error)
      })
  })
}

function fetchVersions () {
  return new Promise(function (resolve, reject) {
    $.getJSON('/api/v1/scenes/versions/')
      .done(function (data) {
        resolve(data)
      })
      .fail(function (error) {
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
