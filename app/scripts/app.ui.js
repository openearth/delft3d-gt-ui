var UI = {};

//var dependency = dependency || require('./dependency');
(function()
{
  'use strict';

// Refresh GUI with new server data.
// Should be done with templates later.
UI.UpdateModelList = function(data)
{


  if (!(data !== undefined && $.isArray(data.models) === true))
  {
    console.log("not an array");
    return;
  }


  var tbody = $("#list-model-status tbody");
  tbody.empty();

  // Create new content:
  var str = "";
  for(var i = 0; i < data.models.length; i++)
  {
    var model = data.models[i];

    str += "<tr class='row_" + (i%2) + " " +model.status + "'>";
    str += "<td>" + model.runid + "</td>";
    str += "<td>" + model.status + " " + model.progress + "%</td>";
    str += "<td>" + model.timeleft + "</td>";
    //str += "<td class='column-actions'><button class='btn btn-border btn-small'><span class='glyphicon glyphicon-info-sign'></span></button></td>";
    str += "<td>&nbsp;</td>";
    str += "</tr>";

  }

  tbody.html(str);
};

// Register event handler for the current GUI.
// For model start test primarily.
UI.RegisterHandlers = function()
{

  // Submit button has been pressed
  $("#newrun_submit").click( function()
  {
      var scenario_options = {};
      var model_options = {};

      scenario_options.runid = $("newrun-name").val();
      scenario_options.author = "placeholder";

      model_options.timestep = $("#newrun-riverwidth").val();

      // [TODO] We skip input validation at the moment!
      Models.runModel( scenario_options, model_options, function(ret)
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

            if (ret.status.code === "ok")
            {
              $("#newrun-alert .alert").html("Model is starting...");
              $("#newrun-alert .alert").removeClass("alert-warning").addClass("alert-success");
              $("#newrun-alert").show();
            }
          }

        }
      });
  });


};



// export the namespace object
if (typeof module !== 'undefined' && module.exports)
{
  module.exports = UI;
}

})();
