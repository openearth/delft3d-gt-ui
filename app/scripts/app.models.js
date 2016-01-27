/*jshint quotmark: double */

var Models = {};

//var dependency = dependency || require('./dependency');
(function()
{
  "use strict";

	// Test function to see if Mocha works.
	Models.MochaTest = function(val1, val2)
	{
		return val1 + val2;
	};

	// Get models from URL, call callback upon completion.
	Models.getModels = function(callback)
	{
		$.ajax(
		{
			url: "sampledata/modelruns.json"
		}).done(function(data)
		{
			if (callback !== undefined)
			{
				callback(data);
			}
		});

	};


	// Run a model, with given options. Optional callback for return.
	Models.runModel = function(scenario_options, model_options, callback)
	{
		// No options defined:
		if (scenario_options === undefined)
		{
			return false;
		}

		if (model_options === undefined)
		{
			return false;
		}

		// [TODO] Validate parameters before sending. (is everything included?)

		// Prepare options for our format.
		var serveroptions = {
			"type": "startrun"
		};

		serveroptions.parameters = {};
		serveroptions.scenario = scenario_options;
		serveroptions.model = model_options;



		$.ajax(
		{
			url: "sampledata/runmodel-ok.json",
			data: serveroptions

		}).done(function(data)
		{

			if (callback !== undefined)
			{
				callback(data);
			}
		});


	};



	// export the namespace object
	if (typeof module !== "undefined" && module.exports)
	{
		module.exports = Models;
	}

})();
