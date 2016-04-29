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
        //url: "sampledata/template.json",
        url: "/scenario/list",
        method: "GET",
        cache: false
      })
        .done(function(data) {
          console.log("GOT DATA:" + data);
          resolve(data);
        })
        .fail(function(error) {
          reject(error);
        });

    });
  }
  return {
    fetchScenarios: fetchScenarios
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
