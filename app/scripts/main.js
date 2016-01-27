(function () {
  'use strict';
  // Main javascript code, initialize components, there shouldn't be much here.

  // Register some event handlers.
  UI.RegisterHandlers();

  // Get list of models:
	Models.getModels( UI.UpdateModelList );


  // Run a model test:
  /*
  var so = { "runid": "run from code", "author": "jln" };
  var mo = { "timestep": 30};

  Models.runModel( so, mo, function(ret)
  {

    if (ret != undefined)
    {
      if (ret.status != undefined)
      {
        if (ret.status.code == "error")
        {
          console.log("An error occured! Reason:" + ret.status.reason);

        }
      }

    }
  });
  */

}());
