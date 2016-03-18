/* global  MessageSceneList MessageSceneDelete MessageSceneCreate MessageSceneChangeState */
var Models;

var exports = (function() {
  "use strict";

  Models = function(App) {
    this.app = App;
  };

  // Enable autorefresh or disable it (interval = 0)
  Models.prototype.toggleAutoUIRefresh = function(callback, interval, forceDirectUpdate) {
    var that = this;


    // If forceDirectUpdate is true we actually execute an update immediately
    if (forceDirectUpdate === true) {
      that.getModels(callback);
    }


    // Clear an existing timer.
    function clearTimer() {
      if (that.refreshTimerId !== -1) {
        clearInterval(that.refreshTimerId);
        that.refreshTimerId = -1;
      }
    }

    if (interval > 0) {

      // Clear existing timer if present.
      clearTimer();

      // Set timer id.
      that.refreshTimerId = setInterval(function() {
        that.getModels(callback);
      }, interval);

    } else {

      // Stop timer.
      clearTimer();
    }

  };

  // Get models from URL, call callback upon completion.
  Models.prototype.getModels = function(callback) {

    var m = new MessageSceneList();

    m.onCompleteCallback(function() {
      $("#alert-connectionfailed").hide();
    });

    m.onErrorCallback(function() {
      $("#alert-connectionfailed").show();
    });

    // Execute AJAX call to remote server to get list of models.
    m.executeRequest(function(items) {
      callback(items);
    });
  };


  // Run a model, with given options. Optional callback for return.
  Models.prototype.prepareModel = function(ScenarioOptions, ModelOptions, callback) {

    //    var that = this;

    /*
     // Validate input of run model.
     // Depends on validator class
     function validateRunModel(so, mo)
     {
     console.log(so);

     var CheckRunId = (validator.isAlphanumeric(so.runid) === true) && (validator.isLength(so.runid, {min: 0, max: 64 }) === true);
     var CheckDt = (validator.isInt(mo.timestep, {min: 1, max: 3600}) === true);

     return CheckRunId && CheckDt;
     }


     if (validateRunModel(ScenarioOptions, ModelOptions) === false)
     {

     return false;
     }
     */

    // Temporary format.
    var serveroptions = {
      "name": ScenarioOptions.runid,
      "dt": ModelOptions.timestep
    };


    var msg = new MessageSceneCreate(serveroptions);

    msg.onCompleteCallback(function() {
      // Handle on complete.
    });

    msg.onErrorCallback(function() {
      // Handle errors
      console.log("Error starting model");
    });

    // Execute AJAX call to remote server to get list of models.
    msg.executeRequest(function(data) {
      // We get returned data here.
      if (callback !== undefined) {
        callback(data);
      }
    });

    return true;

  };


  // Run the model, with the given uuid.
  Models.prototype.runModel = function(modelid, callback) {

    if (modelid === undefined) {

      return false;
    }
    // Start model.
    var msg = new MessageSceneChangeState(modelid);

    msg.executeRequest(function(data) {
      // We get returned data here.
      if (callback !== undefined) {
        callback(data);
      }
    });


  };

  // Fetch a logfile from the server using an AJAX request.
  Models.prototype.fetchLogFile = function(selectedModelData, callback) {


    // No selected data, then we bail.
    if (selectedModelData === undefined) {
      return null;
    }

    // Working dir is at: modeldata.fileurl + delft3d.log
    $.ajax({
        url: selectedModelData.fileurl + "delft3d.log",
        method: "GET"
      })
      .done(function(data) {
        if (callback !== undefined) {
          callback(data);
        }
      });
  };

  // Find a model using a UUID
  Models.prototype.findModelByID = function(id) {

    var templateData = this.app.getTemplateData();

    // For whatever strange reason, ".id" becomes an string. This might happen somewhere in the vue logic.
    for (var i = 0; i < templateData.models.gridData.length; i++) {
      if (parseInt(templateData.models.gridData[i].id) === id) {
        return templateData.models.gridData[i];
      }
    }

    return null;

  };


  // Run a model, with given options. Optional callback for return.
  // Expects  a id in deleteoptions.
  Models.prototype.deleteModel = function(modelid, options, callback) {

    // [TODO] Validate parameters before sending. (is everything included?)
    if (modelid === undefined) {
      return false;
    }

    if (options !== undefined) {
      // For the future, we support additional options.
    }

    var msg = new MessageSceneDelete(modelid);

    msg.onCompleteCallback(function() {
      // Handle on complete.
    });

    msg.onErrorCallback(function() {
      // Handle errors
    });

    // Execute AJAX call to remote server to get list of models.
    msg.executeRequest(function(data) {
      // We get returned data here.
      if (callback !== undefined) {
        callback(data);
      }
    });

    return true;
  };

  return {
    Models: Models
  };

}());


// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
}
