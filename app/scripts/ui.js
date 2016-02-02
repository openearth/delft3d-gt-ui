  /*global InputValidation */
  "use strict";


  var UI = function(models)
  {
    if (models === undefined)
    {
      console.error("No models argument for UI");
    }

    // Store a reference to the models var.
    this.models = models;


    this.validateForm();


  };

  UI.prototype.getModels = function()
  {

    return this.models;
  };

  // Refresh GUI with new server data.
  // Should be done with templates later.
  UI.prototype.UpdateModelList = function(data)
  {

    var me = this;


    // Check if data is present
    if (!(data !== undefined && $.isArray(data) === true))
    {
      console.log("not an array");
      return;
    }

    // Our target table
    var tbody = $("#list-model-status tbody");

    // Create new content:
    var str = "";
    var i = 0;

    $.each( data, function( key, value )
    {
      var model = value.fields;


      str += "<tr id='model-" + model.uuid + "' class='" + model.status + "'>";
      str += "<td>" + model.name + "</td>";
      str += "<td>" + model.status + " " + model.progress + "%</td>";
      str += "<td>" + model.timeleft + "</td>";
      str += "<td class='column-actions'><button class='btn btn-border btn-small btn-model-delete' data-uuid='" + model.uuid + "'><span class='glyphicon glyphicon-remove' ></span></button></td>";

      str += "</tr>";

      i++;
    });

    tbody.empty();
    tbody.html(str);

    // Add event handlers for these items.
    tbody.find(".btn-model-delete").click( function()
    {

      // Remove this item.
      var uuid = $(this).data("uuid");

      me.getModels().deleteModel( { "uuid": uuid }, function () {

        $("#model-" + uuid).remove();
      } );
    });

  };

  // Register event handler for the current GUI.
  // For model start test primarily.
  UI.prototype.registerHandlers = function()
  {
    var me = this;

    // Submit button has been pressed
    $("#newrun-submit").click( function()
      {

        var ScenarioOptions = {};
        var ModelOptions = {};

        ScenarioOptions.runid = $("#newrun-name").val();
        ScenarioOptions.author = "placeholder";

        ModelOptions.timestep = $("#newrun-timestep").val();

        // [TODO] We skip input validation at the moment!
         me.models.prepareModel( ScenarioOptions, ModelOptions, function(ret)
        {

          if (ret !== undefined)
          {
            if (ret.status !== undefined)
            {
              // Some alert things. Turn this into a nice class...
              if (ret.status.code === "error")
              {
                $("#newrun-alert .alert").html("An error occured! Reason:" + ret.status.reason);
                $("#newrun-alert .alert").removeClass("alert-success").addClass("alert-warning");
                $("#newrun-alert").show();

              }

              if (ret.status.code === "success")
              {
                $("#newrun-alert .alert").html("Model is starting...");
                $("#newrun-alert .alert").removeClass("alert-warning").addClass("alert-success");
                $("#newrun-alert").show();

                // Immediatly start the model
                // [temporary code]
                me.models.runModel(ret.uuid);
              }

              // Do a hard refresh right now:
               me.models.getModels( $.proxy(me.UpdateModelList, me) );

            }

          }
        });
    });


    // temp:
/*
    $("#newrun-timestep").on("change keyup", function()
    {
      validate_timestep( $(this) );
    });

    $("#newrun-name").on("change keyup", function()
    {
      validate_name( $(this) );
    });
*/
    // We watch all events in the form input.
    $("#run-model-input-properties input").on("change keyup", function()
    {
      me.validateForm();

      //validate_name( $(this) );
    });
  };

  UI.prototype.validateForm = function()
  {

    var validation = new InputValidation();

    // Array of input checks we have
    var inputchecks = [
      { id: "#newrun-timestep", method: validation.ValidateNumberRange },
      { id: "#newrun-name", method: validation.ValidateAsciiString }
    ];

    // We assume all is well.
    var isvalid = true;



    // Loop through all desired input checks:
    for(var i = 0; i < inputchecks.length; i++)
    {
      var check = inputchecks[i];

      // Element to check:
      var target = $(check.id);

      // Validate the input based on early defined method.
      var result = check.method(target, target.val());

      // Something was not valid, so we remember this.
      // We keep validating though, just to make clear what is wrong to the user.
      if (result === false)
      {
        isvalid = false;
      }

      // Change color of input depending on the state:
      var group = target.closest(".input-group");
      group.toggleClass("error", !result);

      // Toggle state of submit button.
      toggleSubmit(isvalid);
    }





    function toggleSubmit(state)
    {
      var element = $("#newrun-submit");

      if (state === true)
      {
        /// Everything was OK. Enable the button.
        element.removeAttr("disabled");

      } else {

        // There is an error somewhere, disable the submit button.
        element.attr("disabled", "disabled");
      }
    }

  };











  // export the namespace object
  if (typeof module !== "undefined" && module.exports)
  {
    module.exports = UI;
  }