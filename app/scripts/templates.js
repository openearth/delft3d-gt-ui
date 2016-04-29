var exports = (function() {
  "use strict";

  /**
   * Fetch all models.
   *
   * @return {Promise}
   */
  function fetchTemplates() {
    return new Promise(function(resolve, reject) {

      //Load test template data:
      $.ajax({
        //url: "sampledata/template.json",
        url: "scenario/template/list",
        method: "GET"
      })
        .done(function(data) {
          resolve(data);
        })
        .fail(function(error) {
          reject(error);
        });

    });
  }
  return {
    fetchTemplates: fetchTemplates
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
