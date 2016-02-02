(function () {
    "use strict";
    /*global UI Models*/

  // Main javascript code, initialize components, there shouldn't be much here.

  var config =
  {
    "BaseURL": "http://136.231.174.53:8001"
  };

  // Move these files to an app class later.
  var models = new Models();
  models.setConfiguration(config);


  // Register some event handlers.
  var ui = new UI(models);
  ui.registerHandlers();

  // Get list of models:
	models.getModels( ui.UpdateModelList );

  // Enable auto refresh.
  models.toggleAutoUIRefresh( $.proxy(ui.UpdateModelList, ui), 20000);


}());
