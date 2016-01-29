var UI = {};

//var dependency = dependency || require('./dependency');
(function()
{
  "use strict";
  /*global Models*/

// Refresh GUI with new server data.
// Should be done with templates later.
UI.UpdateModelList = function(data)
{


  if (!(data !== undefined && $.isArray(data) === true))
  {
    console.log("not an array");
    return;
  }


  var tbody = $("#list-model-status tbody");
  tbody.empty();

  // Create new content:
  var str = "";
  //for(var i = 0; i < data.length; i++)
  var i = 0;
  $.each( data, function( key, value )
  {
    var model = value.fields; //data.fields[i];


    str += "<tr id='model-" + model.uuid + "' class='" + model.status + "'>";
    str += "<td>" + model.name + "</td>";
    str += "<td>" + model.status + " " + model.progress + "%</td>";
    str += "<td>" + model.timeleft + "</td>";
    str += "<td class='column-actions'><button class='btn btn-border btn-small btn-model-delete' data-uuid='" + model.uuid + "'><span class='glyphicon glyphicon-remove' ></span></button></td>";

    str += "</tr>";

    i++;
  });

  tbody.html(str);

  // Add event handlers for these items.
  tbody.find(".btn-model-delete").click( function()
  {
    // Remove this item.
    var uuid = $(this).data("uuid");
    Models.deleteModel( { "uuid": uuid }, function () {
      $("#model-" + uuid).remove();
    } );
  });

};

// Register event handler for the current GUI.
// For model start test primarily.
UI.registerHandlers = function()
{

  // Submit button has been pressed
  $("#newrun_submit").click( function()
  {
      var ScenarioOptions = {};
      var ModelOptions = {};

      ScenarioOptions.runid = $("#newrun-name").val();
      ScenarioOptions.author = "placeholder";

      ModelOptions.timestep = $("#newrun-timestep").val();



//return;
      // [TODO] We skip input validation at the moment!
      Models.runModel( ScenarioOptions, ModelOptions, function(ret)
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
            Models.getModels( UI.UpdateModelList );

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

})();
