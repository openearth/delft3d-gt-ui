/* globals */

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

      $.ajax("/api/v1/scenes/", {cache: false})
      // $.ajax("/scene/list", {cache: false})
        .done(function(json) {

          itemsCache = {};

          // copy object
          _.each(json, function(model) {

            // TODO: replace the following code

            // retrieves the scenario id from the scenario_url parameter
            var s = model.scenario_url,
                i = s.search(/\/\d\d\//);

            model.scenario = s.slice(i, i + 3).replace("/", "");

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
          .then(models => {
            // search through the list of models
            // The `_.matchesProperty` iteratee shorthand.
            // returns undefined if not found
            var secondTryModel = _.find(models, ["id", id]);

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

  function deleteModel(id, options) {

    return new Promise(function(resolve, reject) {
      // add extra options to id
      var postData = _.assign({id: id}, options);

      $.ajax({
        url: "/scene/delete",
        data: postData,
        method: "POST"
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
      $.ajax({
        url: "/scene/stop",
        data: {id: id},
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

  function createModel(model) {

    return new Promise(function(resolve, reject) {
      $.ajax({
        url: "/scene/create",
        data: model,
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


  function fetchLog(id) {

    return new Promise(function(resolve, reject) {
      try {
        var model = itemsCache[id];

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
    createModel: createModel,
    deleteModel: deleteModel,
    startModel: startModel,
    exportModel: exportModel,
    stopModel: stopModel,
    publishModel: publishModel
  };
}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
