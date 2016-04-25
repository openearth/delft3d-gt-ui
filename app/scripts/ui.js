/* global InputValidation, createModel, startModel  */

var exports = (function () {
  "use strict";

  function validateForm() {

    var validation = new InputValidation();

    // Array of input checks we have
    var inputchecks = [
      { id: "#newrun-timestep", method: validation.ValidateNumberRange },
      { id: "#newrun-name", method: validation.ValidateAsciiString }
    ];

    // We assume all is well.
    var isvalid = true;

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


  }


  function prepareModel(ScenarioOptions, ModelOptions) {
    // model as expected by /scene/create
    var model = {
      name: ScenarioOptions.runid,
      info: JSON.stringify({
        dt: ModelOptions.timestep
      })
    };

    return model;
  }

  function submitModel() {
    var scenarioOptions = {
      runid: $("#newrun-name").val(),
      author: "placeholder"
    };
    var modelOptions = {
      timestep: $("#newrun-timestep").val()
    };

    // TODO: We skip input validation at the moment!
    var model = prepareModel(scenarioOptions, modelOptions);

    // create the model and update the gui.
    createModel(model)
      .then(ret => {
        // otherwise continue
        $("#newrun-alert .alert").html("Model is queued...");
        $("#newrun-alert .alert").removeClass("alert-warning").addClass("alert-success");
        $("#newrun-alert").show();

        // if creating succeeded, start the model
        startModel(ret.scence.id);

        // Delay and hide after a moment
        $("#newrun-alert").delay(4000).fadeOut(500);
      });
  }

  // Submit button has been pressed
  // We watch all events in the form input.
  $("#run-model-input-properties input")
    .on("change keyup", function() {
      validateForm();
    });

  return {
    submitModel: submitModel
  };
}());

// If we're in node export to models
if (typeof module !== "undefined" && module.exports) {
  module.exports = exports;
} else {
  // make global
  _.assign(window, exports);
}
