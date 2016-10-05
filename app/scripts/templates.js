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
      $.getJSON("/api/v1/templates/")
        .done(function(data) {
          resolve(data);
        })
        .fail(function(error) {
          reject(error);
        });

    });
  }

  function fetchSearchTemplate() {
    return new Promise(function(resolve, reject) {

      //Load test template data:
      $.getJSON("/api/v1/searchforms/")
        .done(function(data) {
          // return the one and only search template
          // the backend returns a list but there shall only be one
          resolve(_.first(data));
        })
        .fail(function(error) {
          reject(error);
        });

    });
  }

  return {
    fetchTemplates: fetchTemplates,
    fetchSearchTemplate: fetchSearchTemplate
  };

}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
