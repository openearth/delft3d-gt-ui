/* global */

// Message that is used to create a new run item.
// Reference to format used: https://publicwiki.deltares.nl/display/Delft3DGT/Django_app
var MessageSceneCreate;

var exports = (function() {
  "use strict";


  // Constructor of the MessageSceneCreate class.
  // The callback is used when data is returned after receiving and validation are complete.
  MessageSceneCreate = function(options) {

    if (options === undefined) {
      console.error("[MessageSceneCreate] No options specified for create.");
      return null;
    }

    // Store reference to the id we want to save.
    this.options = this.prepareOptions(options);

    // The location where this message will request to.
    this.targetURL = "/scene/create";

    // We assume no error callbacks normally:
    this.onError = null;
    this.onComplete = null;

  };


  // This function prepares options for the create request.
  MessageSceneCreate.prototype.prepareOptions = function(inoptions) {
    var options = {};

    // Name is mandatory.
    if (inoptions.name === undefined) {
      return null;
    }

    options.name = inoptions.name;

    // [Todo]: with a loop of known properties.

    if (inoptions.state !== undefined) {
      options.state = inoptions.state;
    }

    if (inoptions.info !== undefined) {
      options.info = inoptions.info;
    }

    return options;

  };


  /// Perform actual request
  MessageSceneCreate.prototype.executeRequest = function(callback) {
    var that = this;

    if (callback === undefined) {
      console.error("[MessageSceneCreate] No callback in executeRequest");

      return;
    }

    this.request(function(data) {
      that.receivedData(data, callback);

    });
  };

  // We have received data, process and return.
  MessageSceneCreate.prototype.receivedData = function(data, callback) {

    // Process data
    callback(data);

  };

  /// Callback called when things went okay, connection wise (does not have anything to do with received data)
  MessageSceneCreate.prototype.onCompleteCallback = function(callback) {
    this.onComplete = callback;
  };

  /// Callback called when things went wrong, connection wise (does not have anything to do with received data)
  MessageSceneCreate.prototype.onErrorCallback = function(callback) {
    this.onError = callback;
  };

  // Code that performs the actual request.
  MessageSceneCreate.prototype.request = function(callback) {

    var url = this.targetURL;
    var that = this;

    // If options is null, then it was not valid.
    if (this.options == null) {

      console.error("[MessageSceneCreate] No options specified");

      if (that.onError !== undefined && that.onError !== null) {
        that.onError();

      }

      return false;
    }

    $.ajax({
        url: url,
        data: this.options,
        method: "POST"
      })
      .done(function(data) {

        // Always call comlete callback (connection related)
        if (that.onComplete !== undefined && that.onComplete !== null) {
          that.onComplete();
        }


        if (callback !== undefined) {
          callback(data);
        }

      })
      .error(function(xhr, status, error) {

        // Call error callback, let application know something went wrong.
        if (that.onError !== undefined && that.onError !== null) {

          that.onError({
            status: status,
            error: error
          });
        }
      });

  };

  return {
    MessageSceneCreate: MessageSceneCreate
  };
}());



// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
}
