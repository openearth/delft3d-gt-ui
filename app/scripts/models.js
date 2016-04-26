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
      itemsCache = {};
      $.ajax("/scene/list")
        .done(function(json) {
          console.log("before", _.assign({}, json.scene_list[0]));
          // copy object
          _.each(json.scene_list, function(model) {
            itemsCache[model.id] = model;
          });
          console.log("after", itemsCache["25"]);
          resolve(json.scene_list);
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
              reject(new Error("Model not found, even after updating "));
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
  function startModel(id) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: "/scene/start",
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
      var url = model.fileurl + "delft3d/delft3d.log";

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
    startModel: startModel
  };
}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
