/* global */

// Message that is used to change run state of an item.
// Reference to format used: https://publicwiki.deltares.nl/display/Delft3DGT/Django_app

// Right now we only "start" things.
var MessageSceneChangeState;

var exports = (function() {
  "use strict";


  // Constructor of the MessageSceneChangeState class.
  // The callback is used when data is returned after receiving and validation are complete.
  MessageSceneChangeState = function(id) {

    this.modelid = null;

    if (id !== undefined) {

      // Store reference to the id we want to save.
      if (isNaN(id) === false) {
        this.modelid = id;
      }

    } else {

      console.error("[MessageSceneChangeState] No id specified to start.");
    }

    // The location where this message will request to.
    this.targetURL = "/scene/start";

    // We assume no error callbacks normally:
    this.onError = null;
    this.onComplete = null;

  };


  /// Perform actual request
  MessageSceneChangeState.prototype.executeRequest = function(callback) {
    var that = this;

    if (callback === undefined) {
      console.error("[MessageSceneChangeState] No callback in executeRequest");

      return;
    }

    this.request(function(data) {

      that.receivedData(data, callback);

    });
  };

  // We have received data, process and return.
  MessageSceneChangeState.prototype.receivedData = function(data, callback) {

    // Process data
    callback(data);

  };

  /// Callback called when things went okay, connection wise (does not have anything to do with received data)
  MessageSceneChangeState.prototype.onCompleteCallback = function(callback) {
    this.onComplete = callback;
  };

  /// Callback called when things went wrong, connection wise (does not have anything to do with received data)
  MessageSceneChangeState.prototype.onErrorCallback = function(callback) {
    this.onError = callback;
  };

  // Code that performs the actual request.
  MessageSceneChangeState.prototype.request = function(callback) {
    var url = this.targetURL;
    var that = this;

    // Does not have a valid modelid, return false.
    if (this.modelid === null) {
      return false;
    }

    var postdata = {
      id: this.modelid
    };

    $.ajax({
        url: url,
        data: postdata,
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
      .fail(function(xhr, status, error) {
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
    MessageSceneChangeState: MessageSceneChangeState
  };
}());



// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
}
