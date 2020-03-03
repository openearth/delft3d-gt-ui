import $ from 'jquery'
import _ from 'lodash'

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

function getDialog (element, component, dialogId) {
  console.log('getdialog', element, component, dialogId)
  for (var i = 0; i < element.$children.length; i++) {
    // Check if name matches:
    if (element.$children[i].dialogId === dialogId) {
      return element.$children[i]
    }
  }

  return null
}

export {
  fetchUsers,
  fetchTemplates,
  fetchSearchTemplate,
  fetchVersions,
  getDialog
}
