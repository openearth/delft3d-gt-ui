/* global */

// List the models
// Reference to format used: https://publicwiki.deltares.nl/display/Delft3DGT/Django_app

var MessageSceneList;

var exports = (function () {
  "use strict";


  // Constructor of the MessageSceneList class.
  // The callback is used when data is returned after receiving and validation are complete.
  MessageSceneList = function()
  {

    // The location where this message will request to.
    this.targetURL = "/scene/list";

    // We assume no error callbacks normally:
    this.onError = null;
    this.onComplete = null;

  };


  /// Perform actual request
  MessageSceneList.prototype.executeRequest = function(callback)
  {
    var that = this;

    if (callback === undefined)
    {
      console.error("[MessageSceneList] No callback in executeRequest");

      return;
    }

    this.request(function(data)
    {
      that.receivedData(data, callback);

    });
  };

  // We have received data from somewhere, turn it into a
  MessageSceneList.prototype.receivedData = function(data, callback)
  {

    var returnList = {
      scenes: []
    };

    // We process the data to generate a uniform array with data we recognize.
    if (data.scene_list === undefined)
    {
      console.warn("[MessageSceneList] There is no scene list in the received data");
      return;
    }

    // Loop through the scene list rows.
    var properties = {
      fileurl: { type: "string", required: false },
      id: { type: "number", required: true },
      info: { type: "string", required: false },
      name: { type: "string", required: true },
      workingdir: { type: "string", required: false },
      state: { type: "string", required: true },
      simulationtask:
      {
        type: "object", required: true,  // We do not check on subitems yet, later priority.
        properties:
        {
          state: { type: "string", required: true},
          "state_meta": { type: "object", required: false},
          uuid: { type: "string"}
        }
      },

      postprocessingtask:
      {
        type: "object", required: true,
        properties:
        {
          state: { type: "string", required: true},
          "state_meta": { type: "object", required: false},
          uuid: { type: "string"}
        }
      },
      processingtask: { type: "object", required: true }
    };


    for(var i = 0; i < data.scene_list.length; i++)
    {
      var scene = data.scene_list[i];
      var sceneInfo = { };
      var valid = false;

      // Loop through known properties:

      /*eslint-disable no-loop-func */
      $.each(properties, function(key, value)
      {
        valid = true;

        if (scene[key] !== undefined)
        {
          sceneInfo[key] = scene[key];

        } else {

          sceneInfo[key] = "";

          console.warn("[MessageSceneList] Key: " + key + " is required and does not exist");

          if (value.required === true)
          {
            valid = false;
          }
        }
      });
    /*eslint-enable no-loop-func */

      // If we are vaid
      if (valid === true)
      {
        returnList.scenes.push(sceneInfo);
      }

    }


    console.log("ret: " + returnList.scenes.length);

    // And at the end return everything through a callback
    callback(returnList);

  };


  /// Callback called when things went okay, connection wise (does not have anything to do with received data)
  MessageSceneList.prototype.onCompleteCallback = function(callback)
  {
    this.onComplete = callback;
  };

  /// Callback called when things went wrong, connection wise (does not have anything to do with received data)
  MessageSceneList.prototype.onErrorCallback = function(callback)
  {
    this.onError = callback;
  };


  MessageSceneList.prototype.request = function(callback)
  {
    var url = this.targetURL;
    var that = this;

    $.ajax({
      url: url
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
    MessageSceneList: MessageSceneList
  };
}());



// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
}
