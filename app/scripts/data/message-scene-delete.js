/* global */

// Message that is used to remove an item from the model database.
// Reference to format used: https://publicwiki.deltares.nl/display/Delft3DGT/Django_app
var MessageSceneDelete;

var exports = (function () {
  "use strict";


  // Constructor of the MessageSceneDelete class.
  // The callback is used when data is returned after receiving and validation are complete.
  MessageSceneDelete = function(id)
  {
    if (id === undefined)
    {
      console.error("[MessageSceneDelete] No id specified to remove.");
      return null;
    }


    // Store reference to the id we want to save.
    this.modelid = id;

    // The location where this message will request to.
    this.targetURL = "/scene/delete";

    // We assume no error callbacks normally:
    this.onError = null;
    this.onComplete = null;

  };


  /// Perform actual request
  MessageSceneDelete.prototype.executeRequest = function(callback)
  {
    var that = this;

    if (callback === undefined)
    {
      console.error("[MessageSceneDelete] No callback in executeRequest");

      return;
    }

    this.request(function(data)
    {
      that.receivedData(data, callback);

    });
  };

  // We have received data, process and return.
  MessageSceneDelete.prototype.receivedData = function(data, callback)
  {
    // Process data
    callback();

  };

  /// Callback called when things went okay, connection wise (does not have anything to do with received data)
  MessageSceneDelete.prototype.onCompleteCallback = function(callback)
  {
    this.onComplete = callback;
  };

  /// Callback called when things went wrong, connection wise (does not have anything to do with received data)
  MessageSceneDelete.prototype.onErrorCallback = function(callback)
  {
    this.onError = callback;
  };

  // Code that performs the actual request.
  MessageSceneDelete.prototype.request = function(callback)
  {
    var url = this.targetURL;
    var that = this;
    var postdata =
    {
      id: this.modelid
    };

    $.ajax({
      url: url,
      data: postdata,
      method: "POST"
    })
    .done(function(data) {

      // Always call comlete callback (connection related)
      if (that.onComplete !== undefined && that.onComplete !== null)
      {
        that.onComplete();
      }


      if (callback !== undefined) {
        callback(data);
      }

    })
    .error(function() {

      // Call error callback, let application know something went wrong.
      if (that.onError !== undefined && that.onError !== null)
      {
        that.onError();
      }

    });

  };

  return {
    MessageSceneDelete: MessageSceneDelete
  };
}());



// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
}
