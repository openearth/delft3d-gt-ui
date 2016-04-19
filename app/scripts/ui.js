/* global InputValidation  */

(function () {
  "use strict";

  // Submit button has been pressed
  // We watch all events in the form input.
  $("#run-model-input-properties input")
    .on("change keyup", function(el) {
      var form = el.closest("form");
      validateForm(form);
    });


  function submitModel(model) {
    var scenarioOptions = {
      runid: $("#newrun-name").val(),
      author: "placeholder"
    };
    var modelOptions = {
      timestep: $("#newrun-timestep").val()
    };

    // TODO: We skip input validation at the moment!
    prepareModel(scenarioOptions, modelOptions, function(ret) {

      if (!ret.scene) {
        console.log("can'it find a model")
        return;
      };

      // otherwise continue
      $("#newrun-alert .alert").html("Model is queued...");
      $("#newrun-alert .alert").removeClass("alert-warning").addClass("alert-success");
      $("#newrun-alert").show();

      var model = new Model(ret.scence.id);

      model.run();

      // Delay and hide after a moment
      $("#newrun-alert").delay(4000).fadeOut(500);

    });
  };

  function validateForm(form) {

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


  };

}());
