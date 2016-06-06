var exports = (function () {
  "use strict";
  function resolveUrls(object) {
    // look for _url and _scene fields and resolve the URLs
    // note that this creates a copy, so we have to set it back to the original objects
    var urlFields = _.pickBy(
      object,
      function(value, key) {
        // if the key ends with _url or _set, we have to resolve the url
        return key.endsWith("_url") || key.endsWith("_set");
      });

    // we only need the names
    var urlFieldNames = _.keys(urlFields);

    var promises = urlFieldNames.map(function(key) {
      var result = new Promise(function(resolve, reject) {
        // by default we just resolve
        resolve();
      });
      if (_.endsWith(key, "_url")) {
        // get the url
        var url = object[key];
        // define the variable name without _url
        var newKey = _.replace(key, /_url$/, "");

        // replace it
        result = fetch(url)
          .then(function(resp) {
            return resp.json();
          })
          .then(function(json) {
            object[newKey] = json;
            console.log("data fetched and set to object", object, "key", newKey);
            return object;
          });

      }
      if (_.endsWith(key, "_set")) {
        // for all urls, we use fetch and promises so we can return a value once everything is resolved and converted
        var urls = object[key];
        result = Promise.all(
          urls.map(fetch)
        )
          .then(
            // the callback that is called once a url returns
            responses => Promise.all(
              // now we have all responses but we still need the json
              responses.map(
                // so map the json methods, which again return promises
                res => res.json()
              )
            )
              .then(
                // now we have all the jsons, set them to the object
                jsons => {
                  object[newKey] = jsons;
                  return object;
                })
          );
      }
      return result;
    });

    return Promise.all(promises);
  }
  return {
    resolveUrls: resolveUrls
  };
}());


// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
