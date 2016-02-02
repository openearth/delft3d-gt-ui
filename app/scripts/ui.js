  /*global Models*/
  "use strict";
  

  var UI = function(models)
  {
    if (models === undefined)
    {
      console.error("No models argument for UI");
    }

    // Store a reference to the models var.
    this.models = models;


  };

  UI.prototype.getModels = function()
  {
   
    return this.models;
  }

  // Refresh GUI with new server data.
  // Should be done with templates later.
  UI.prototype.UpdateModelList = function(data)
  {

    var _self = this;


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

      _self.getModels().deleteModel( { "uuid": uuid }, function () {
      
        $("#model-" + uuid).remove();
      } );
    });

  };

  // Register event handler for the current GUI.
  // For model start test primarily.
  UI.prototype.registerHandlers = function()
  {
    var _self = this;

    // Submit button has been pressed
    $("#newrun_submit").click( function()
      { 
        var models = new Models();
        var ScenarioOptions = {};
        var ModelOptions = {};

        ScenarioOptions.runid = $("#newrun-name").val();
        ScenarioOptions.author = "placeholder";

        ModelOptions.timestep = $("#newrun-timestep").val();

        // [TODO] We skip input validation at the moment!
         _self.models.runModel( ScenarioOptions, ModelOptions, function(ret)
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
              }

              // Do a hard refresh right now:
               _self.models.getModels( $.proxy(_self.UpdateModelList, _self) );

            }

          }
        });
    });
  };

  // export the namespace object
  if (typeof module !== "undefined" && module.exports)
  {
    module.exports = UI;
  }
