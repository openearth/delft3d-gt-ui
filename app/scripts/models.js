/* global  */



var exports = (function () {
  "use strict";

  // Store items in this cache
  var store = {
    // models are stored in this object, by id
    models: {},
    // params for the search query
    params: {},
    // an interval used for syncing
    interval: null
  };

  /**
   * Fetch all models.
   *
   * @return {Promise}
   */
  function fetchModels() {
    var request = {
      // NEw url:
      url: "/api/v1/scenes/",
      data: store.params,
      // no [] in params
      traditional: true,
      dataType: "json"
    };

    return new Promise(function(resolve, reject) {

      //Load test template data:
      $.ajax(request)
        .done(function(json) {
          _.each(json, function(model) {
            // add type for introspection
            model.type = "scene";
            store.models[model.id] = model;
          });
          resolve(json);
        })
        .fail(function(error) {
          reject(error);
        });
    });
  }

  /**
   * Fetch a model with data with given id.
   *
   * @param {Number} id
   * @return {Promise}
   */
  function fetchModel(id) {



    return new Promise(function(resolve, reject) {

      if (isNaN(id) === true) {
        reject(new Error("Model not found, even after updating"));
      }

      // There was  a cache check here (if (_.has(store.models, id)) ) - but if we always get old data, and it never refreshes.
      // Maybe there should be a timed removal of cached items. But for now, we do not cache it - as we specifically ask to update one model.
      fetchModels()
        .then(mymodels => {
          // search through the list of models
          // The `_.matchesProperty` iteratee shorthand.
          // returns undefined if not found
          var secondTryModel = _.find(mymodels, ["id", id]);

          if (secondTryModel) {
            // Ladies and gentlemen, we got him....
            resolve(secondTryModel);
          } else {
            // still not here....
            reject(new Error("Model not found, even after updating"));
          }
        })
        .catch((error) => {
          reject(error);
        });

    });
  }

  function deleteModel(id) {
    return new Promise(function(resolve, reject) {

      $.ajax({
        url: "/api/v1/scenes/" + id + "/",
        method: "DELETE"
      })
      .done(function(data) {
          // no data to return, just call the callback
          resolve(data);
        })
        .fail(function(error) {
          // we're done
          reject(error);
        });

    });
  }

  function startModel(id) {

    return new Promise(function(resolve, reject) {
      $.ajax({
        url: "/api/v1/scenes/" + id + "/start/",
        method: "PUT"
      })
        .done(function() {
          // no data to return, just call the callback
          resolve();
        })
        .fail(function(error) {
          // we're done
          reject(error);
        });

    });
  }

  function publishModel(id, target) {

    return new Promise(function(resolve, reject) {
      $.ajax({
        url: "/api/v1/scenes/" + id + "/publish_" + target + "/",
        method: "POST"
      })
        .done(function() {
          // no data to return, just call the callback
          resolve();
        })
        .fail(function(error) {
          // we're done
          reject(error);
        });

    });
  }

  function exportModel(id) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: "/api/v1/scenes/" + id + "/start/",
        data: {workflow: "export"},
        method: "PUT"
      })
        .done(function() {
          // no data to return, just call the callback
          resolve();
        })
        .fail(function(error) {
          // we're done
          reject(error);
        });

    });
  }

  // Stop a model.
  function stopModel(id) {
    return new Promise(function(resolve, reject) {
      // Apperantly this has to stay post, but it seems unnecessary.
      $.ajax({
        url: "/api/v1/scenes/" + id + "/stop/",
        data: {id: id},
        method: "PUT"
        })
        .done(function() {
          // no data to return, just call the callback
          resolve();
        })
        .fail(function(error) {
          // we're done
          reject(error);
        });

    });

  }


  /// Batch version of deleteModel. We expect an array of items to delete.
  function deleteModels(ids) {
    // We expect an array of ids.
    if (_.isArray(ids) === false) {
      return false;
    }

    // We need to determine the result of this somehow. [TODO]
    // Loop through all ids:
    for(var i = 0; i < ids.length; i++) {
      deleteModel(ids[i]);
    }

    return true;
  }

  function startModels(ids) {
    // We expect an array of ids.
    if (_.isArray(ids) === false) {
      return false;
    }

    // We need to determine the result of this somehow. [TODO]
    // Loop through all ids:
    for(var i = 0; i < ids.length; i++) {
      startModel(ids[i]);
    }

    return true;
  }

  function stopModels(ids) {

    // We expect an array of ids.
    if (_.isArray(ids) === false) {
      return false;
    }

    // We need to determine the result of this somehow. [TODO]
    // Loop through all ids:
    for(var i = 0; i < ids.length; i++) {
      stopModel(ids[i]);
    }

    return true;
  }


  function fetchLog(id) {
    return new Promise(function(resolve, reject) {
      try {
        var model = store.models[id];


      } catch(e) {
        // if we can't find a model reject and bail out
        reject(e);

        return;
      }

      // Working dir is at: modeldata.fileurl + delf3d + delft3d.log
      var url = model.fileurl + model.info.logfile.location + model.info.logfile.file;

      // Without a filename, we just give back a custom string.
      if (model.info.logfile.file.length === 0) {

        resolve("No log output available yet");
        return;
      }

      $.ajax(url)
        .done(function(text) {
          resolve(text);
        })
        .fail(function(error) {
          console.log("Failed to get log", error);
          reject(error);
        });

    });

  }

  function startSyncModels() {
    // Keep syncing:
    store.interval = setInterval(fetchModels, 10000);

  }

  function stopSyncModels() {
    // Keep syncing:
    clearInterval(store.interval);
    store.interval = null;
  }

  function filterModels(params) {
    store.params = params;
  }

  function getModelStore() {
    return store;
  }

  // exposed objects and functions
  var functions = {
    fetchModels: fetchModels,
    fetchModel: fetchModel,
    fetchLog: fetchLog,
    deleteModel: deleteModel,
    startModel: startModel,
    exportModel: exportModel,
    stopModel: stopModel,
    publishModel: publishModel,
    startModels: startModels,
    stopModels: stopModels,
    deleteModels: deleteModels,
    startSyncModels: startSyncModels,
    stopSyncModels: stopSyncModels,
    filterModels: filterModels
  };

  if (typeof module !== "undefined" && module.exports) {
    // Only for debugging (node) purposes
    functions.getModelStore = getModelStore;
  }

  return functions;
}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
