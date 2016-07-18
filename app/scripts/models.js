/* global  */

// Store items in this cache
var itemsCache = {};

var exports = (function () {
  "use strict";


  /**
   * Fetch all models.
   *
   * @return {Promise}
   */
  function fetchModels() {
    return new Promise(function(resolve, reject) {
      $.getJSON("/api/v1/scenes/", {})
        .done(function(json) {
          _.map(json, function(model) {
            itemsCache[model.id] = model;
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
        return reject(new Error("Model not found, even after updating"));
      }

      if (_.has(itemsCache, id)) {
        // we already have the model, return it
        var model = itemsCache[id];

        resolve(model);
      } else {
        // TODO: We just need 1 model. Use a unique id (uuid)
        // if we don't have it, reset all the models and see if it is there....


        fetchModels()
          .then(mymodels => {
            // search through the list of models
            // The `_.matchesProperty` iteratee shorthand.
            // returns undefined if not found
            var secondTryModel = _.find(mymodels, ["id", id]);

            console.log("secondtry");
            console.log(secondTryModel);
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
      }
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
        console.log(id);
        var model = itemsCache[id];

        console.log("xd");
        console.log(itemsCache);

      } catch(e) {
        // if we can't find a model reject and bail out
        reject(e);
        console.log("model not found for id", id, "while retrieving log");
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

  // exposed objects and functions
  return {
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
    deleteModels: deleteModels
  };
}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
