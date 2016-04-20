// Store items in this cache
var itemsCache = {};

var exports = (function () {
  "use strict";

  /**
   * Fetch a model with data with given id.
   *
   * @param {Number} id
   * @return {Promise}
   */
  function fetchModel(id) {
    return new Promise(function(resolve, reject) {
      try {
        var model = itemsCache[id];

        resolve(model);
      } catch (e) {
        reject(e);
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
      itemsCache = {};
      $.ajax("/scene/list")
        .done(function(json) {
          console.log("json", json);
          _.each(json.scene_list, function(model) {
            itemsCache[model.id] = model;
          });
          resolve(json.scene_list);
        })
        .fail(function(error) {
          reject(error);
        });

    });
  };
  // exposed objects and functions
  return {
    fetchModels: fetchModels,
    fetchModel: fetchModel
  };
}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);

}
