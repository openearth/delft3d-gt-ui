var exports = (function() {
  "use strict";

  /**
   * Fetch all scenarios.
   *
   * @return {Promise}
   */
  function fetchScenarios() {
    return new Promise(function(resolve, reject) {

      //Load test template data:
      $.ajax({
        url: "/api/v1/scenarios/",
        method: "GET",
        cache: false
      })
        .done(function(data) {
          resolve(data);
        })
        .fail(function(error) {
          reject(error);
        });

    });
  }

  function deleteScenario(id, options) {
    return new Promise(function(resolve, reject) {
      // add extra options to id
      var postData = _.assign({id: id}, options);

      $.ajax({
        url: "/scenario/delete",
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


  return {
    fetchScenarios: fetchScenarios,
    deleteScenario: deleteScenario
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
