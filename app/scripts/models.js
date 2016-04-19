// Store items in this cache
var itemsCache = {};

(function () {
  "use strict";

  /**
   * Fetch a model with data with given id.
   *
   * @param {Number} id
   * @return {Promise}
   */
  function fetchModel(id) {
    return new Promise(function(resolve, reject) {
      if (itemsCache[id]) {
        resolve(itemsCache[id]);
      } else {
        fetch("/models/" + id, function() {}).
          then(function(resp) {
            return resp.json();
          })
          .then(function(json) {
            itemsCache[id] = json;
            resolve(json);
          })
          .catch(function(error) {
            reject(error);
          });
      };
    });
  };

  /**
   * Fetch all models.
   *
   * @return {Promise}
   */
  function fetchModels() {
    return new Promise(function(resolve, reject) {
      fetch("/models", function() {}).
        then(function(resp) {
          return resp.json();
        })
        .then(function(json) {
          _.each(json, function(model) {
            itemsCache[model.id] = json;
          });
          resolve(json);
        })
        .catch(function(error) {
          reject(error);
        });

    });
  };

}());
