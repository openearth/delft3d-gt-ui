/* global  */
var Models;

var exports = (function () {
  "use strict";

  Models = function(App, Config) {
    this.BaseURL = Config.BaseURL;
    this.app = App;
  };

  // Set some configuration options such as model server location.
  Models.prototype.setConfiguration = function(Config) {
    this.BaseURL = Config.BaseURL;
  };

  // Test function to see if Mocha works.
  Models.prototype.MochaTest = function(val1, val2) {
    return val1 + val2;
  };


  // Enable autorefresh or disable it (interval = 0)
  Models.prototype.toggleAutoUIRefresh = function(callback, interval, forceDirectUpdate) {
    var that = this;

    // If forceDirectUpdate is true we actually execute an update immedialty
    if (forceDirectUpdate === true)
    {
      that.getModels(callback);
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

    // Clear an existing timer.
    function clearTimer() {
      if (that.refreshTimerId !== -1) {
        clearInterval(that.refreshTimerId);
        that.refreshTimerId = -1;
      }
    }
  };

  // Get models from URL, call callback upon completion.
  Models.prototype.getModels = function(callback) {
    var that = this;

    var url = that.BaseURL + "/runs/";

    $.ajax({
      url: url
    })
      .done(function(data) {
        $("#alert-connectionfailed").hide();

        if (callback !== undefined) {
          callback(data);
        }

      })
      .error(function() {
        $("#alert-connectionfailed").show();
      });

  };


  // Run a model, with given options. Optional callback for return.
  Models.prototype.prepareModel = function(ScenarioOptions, ModelOptions, callback) {

    var that = this;

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


    // [TODO] Validate parameters before sending. (is everything included?)

    // Prepare options for our format.
    // Temporary format.
    var serveroptions = {
      "type": "startrun",
      "name": ScenarioOptions.runid,
      "dt": ModelOptions.timestep
    };

    //serveroptions.parameters = {};
    //serveroptions.scenario = ScenarioOptions;
    //serveroptions.model = ModelOptions;

    $.ajax({
      url: that.BaseURL + "/createrun/",
      //url: "sampledata/runmodel-ok.json",
      data: serveroptions,
      method: "GET" // Should be a POST later
    })
      .done(function(data) { //moved here for Mocha.

        if (callback !== undefined) {
          callback(data);
        }
      });

    return true;

  };


  // Run the model, with the given uuid.
  Models.prototype.runModel = function(uuid, callback) {
    var that = this;

    if (uuid === undefined) {
      return;
    }

    var params = {
      uuid: uuid
    };

    $.ajax({
      url: that.BaseURL + "/dorun/",
      //url: "sampledata/runmodel-ok.json",
      data: params,
      method: "GET", // Should be a POST later
      done: function(data) { //moved here for Mocha.

        if (callback !== undefined) {
          callback(data);
        }
      }

    });

  };

  // Fetch a logfile from the server using an AJAX request.
  Models.prototype.fetchLogFile = function(uuid, callback)
  {
    $.ajax({
      //url: that.BaseURL + "/deleterun/",
      url: "sampledata/logfile.f34",
      method: "GET" // Should be a POST later
    })
    .done(function(data) {
      if (callback !== undefined) {
        callback(data);
      }
    });
  };

  // Find a model using a UUID
  Models.prototype.findModelByUUID = function(uuid)
  {

    var templateData = this.app.getTemplateData();

    for (var i = 0; i < templateData.models.gridData.length; i++)
    {
      if (templateData.models.gridData[i].fields.uuid === uuid)
      {
        return templateData.models.gridData[i];
      }
    }

    return null;

  };


  // Run a model, with given options. Optional callback for return.
  // Expects  a UUID in deleteoptions.
  Models.prototype.deleteModel = function(DeleteOptions, callback) {
    var that = this;

    // No options defined:
    if (DeleteOptions === undefined) {
      return false;
    }


    // [TODO] Validate parameters before sending. (is everything included?)
    if (DeleteOptions.uuid === undefined || DeleteOptions.uuid.length === 0) {
      return false;
    }

    // Prepare options for our format.
    var deleteoptions = {
      "type": "deleterun"
    };

    deleteoptions.parameters = {};
    deleteoptions.uuid = DeleteOptions.uuid;


    $.ajax({
      url: that.BaseURL + "/deleterun/",
      data: deleteoptions,
      method: "GET" // Should be a POST later
    })
    .done(function(data) {
      if (callback !== undefined) {
        callback(data);
      }
    });
  };

  return {
    Models: Models
  };

}());


// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
}
