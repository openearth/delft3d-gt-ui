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
      $.getJSON("/api/v1/scenarios/")
        .done(function(data) {
          //console.log("scenarios", data);
          resolve(data);
        })
        .fail(function(error) {
          reject(error);
        });

    });
  }

  function deleteScenario(id) {


    return new Promise(function(resolve, reject) {
      // add extra options to id
      //var postData = _.assign({id: id}, options);
      if (id === undefined) {
      }

      $.ajax({
        url: "/api/v1/scenarios/" + id + "/",
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
