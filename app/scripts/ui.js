/* global InputValidation  */

// exports

var UI;

var exports = (function () {
  "use strict";

  // Constructor of our UI class
  UI = function(models) {
    if (models === undefined) {
      console.error("No models argument for UI");
    }

    // Store a reference to the models var.
    this.models = models;

    // Immediatly validate form at start.
    this.validateForm();
  };

  // Return the list of models.
  UI.prototype.getModels = function() {

    return this.models;
  };

  // Refresh GUI with new server data.
  // Should be done with templates later.
  UI.prototype.UpdateModelList = function(data) {

    // Check if data is present
    if (!(data !== undefined && $.isArray(data) === true)) {
      console.log("not an array");
      return;
    }

    // Fix null values if they exist in the fields field.
    $.each(data, function (key, value)
    {
      var model = value.fields;
      var info = { "percent_completed": "", "time_to_finish": "" };

      // Replace info if available.
      if (model.info !== null)
      {

        model.info = model.info.replace(/'/g, "\"");

        try
        {
          info = jQuery.parseJSON(model.info);
        }
        catch(err)
        {
          // Not valid json, inform us of that.
          console.log("Invalid JSON received from server");
        }
      }

      // Replace:
      value.fields.info = info;


    });
    // Store in the vue controller:
    if (window.vuevm !== undefined)
    {
      window.vuevm.models.gridData = data;
    }
  };

  // Register event handler for the current GUI.
  // For model start test primarily.
  UI.prototype.registerHandlers = function() {
    var that = this;

    // Submit button has been pressed
    // We watch all events in the form input.
    $("#run-model-input-properties input")
      .on("change keyup", function() {
        that.validateForm();
      });
  };

  UI.prototype.submitModel = function()
  {
    var that = this;

    var ScenarioOptions = {};
    var ModelOptions = {};

    ScenarioOptions.runid = $("#newrun-name").val();
    ScenarioOptions.author = "placeholder";

    ModelOptions.timestep = $("#newrun-timestep").val();

    // [TODO] We skip input validation at the moment!
    that.models.prepareModel(ScenarioOptions, ModelOptions, function(ret) {

      if (ret !== undefined) {
        if (ret.status !== undefined) {
          // Some alert things. Turn this into a nice class...
          if (ret.status.code === "error") {
            $("#newrun-alert .alert").html("An error occured! Reason:" + ret.status.reason);
            $("#newrun-alert .alert").removeClass("alert-success").addClass("alert-warning");
            $("#newrun-alert").show();

          }

          if (ret.status.code === "success") {
            $("#newrun-alert .alert").html("Model is queued...");
            $("#newrun-alert .alert").removeClass("alert-warning").addClass("alert-success");
            $("#newrun-alert").show();

            // Immediatly start the model
            // [temporary code]
            that.models.runModel(ret.uuid);
          }

          // Delay and hide after a moment
          $("#newrun-alert").delay(4000).fadeOut(500);

          // Do a hard refresh right now:
          that.models.getModels($.proxy(that.UpdateModelList, that));

        }

      }
    });
  };

  UI.prototype.validateForm = function() {

    var validation = new InputValidation();

    // Array of input checks we have
    var inputchecks = [
      { id: "#newrun-timestep", method: validation.ValidateNumberRange },
      { id: "#newrun-name", method: validation.ValidateAsciiString }
    ];

    // We assume all is well.
    var isvalid = true;

    // Loop through all desired input checks:
    for(var i = 0; i < inputchecks.length; i++) {
      var check = inputchecks[i];

      // Element to check:
      var target = $(check.id);

      // Validate the input based on early defined method.
      var result = check.method(target, target.val());

      // Something was not valid, so we remember this.
      // We keep validating though, just to make clear what is wrong to the user.
      if (result === false) {
        isvalid = false;
      }

      // Change color of input depending on the state:
      var group = target.closest(".input-group");

      group.toggleClass("error", !result);

      // Toggle state of submit button.
      toggleSubmit(isvalid);
    }

    // Toggle submit button state based upon boolean argument
    function toggleSubmit(state) {
      var element = $("#newrun-submit");

      if (state === true) {
        /// Everything was OK. Enable the button.
        element.removeAttr("disabled");

      } else {

        // There is an error somewhere, disable the submit button.
        element.attr("disabled", "disabled");
      }
    }

  };
  return {
    UI: UI
  };

}());

// export the namespace object
if (typeof module !== "undefined" && module.exports) {
  // if we have modules
  module.exports = exports;
}
