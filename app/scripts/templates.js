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
      $.getJSON({
        url: "/api/v1/templates/"
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
