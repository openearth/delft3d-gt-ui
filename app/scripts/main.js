(function () {
    "use strict";
    /*global UI Models*/

  // Main javascript code, initialize components, there shouldn't be much here.

  var config =
  {
    "BaseURL": "http://136.231.174.53:8000"
  };

  // Move these files to an app class later.

  Models.setConfiguration(config);


  // Register some event handlers.
  UI.registerHandlers();

  // Get list of models:
	Models.getModels( UI.UpdateModelList );

  // Enable auto refresh.
  Models.toggleAutoUIRefresh( UI.UpdateModelList, 20000);


}());
