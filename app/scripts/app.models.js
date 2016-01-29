/*jshint quotmark: double */

var Models = {};

//var dependency = dependency || require('./dependency');
(function()
{
  "use strict";

	// Set some configuration options such as model server location.
	Models.setConfiguration = function(Config)
	{
		this.BaseURL = Config.BaseURL;
	};

	// Test function to see if Mocha works.
	Models.MochaTest = function(val1, val2)
	{
		return val1 + val2;
	};


	// Enable autorefresh or disable it.
	Models.toggleAutoUIRefresh = function(callback, interval)
	{
		var self = this;


		if (interval > 0)
		{

			self.refreshTimerId = setInterval(Models.getModels(callback), interval);
		}
		else
		{
			if (self.refreshTimerId !== -1)
			{
				clearInterval(self.refreshTimerId);
				self.refreshTimerId = -1;
			}
		}
	};

	// Get models from URL, call callback upon completion.
	Models.getModels = function(callback)
	{
		var self = this;
		$.ajax(
		{
			url: self.BaseURL + "/runs/"
		}).done(function(data)
		{
			if (callback !== undefined)
			{
				callback(data);
			}
		});

	};


	// Run a model, with given options. Optional callback for return.
	Models.runModel = function(ScenarioOptions, ModelOptions, callback)
	{
		var self = this;

		// No options defined:
		if (ScenarioOptions === undefined)
		{
			return false;
		}

		if (ModelOptions === undefined)
		{
			return false;
		}

		// [TODO] Validate parameters before sending. (is everything included?)

		// Prepare options for our format.
		// Temporary format.
		var serveroptions = {
			"type": "startrun",
			"name": ScenarioOptions.runid,
			"dt": ModelOptions.timestep
		};

		//serveroptions.parameters = {};
		//serveroptions.scenario = ScenarioOptions;
		//serveroptions.model = ModelOptions;



		$.ajax(
		{
			url: self.BaseURL + "/createrun/",
			//url: "sampledata/runmodel-ok.json",
			data: serveroptions,
			method: "GET" // Should be a POST later


		}).done(function(data)
		{

			if (callback !== undefined)
			{
				callback(data);
			}
		});


	};

	// Run a model, with given options. Optional callback for return.
	// Expects  a UUID in deleteoptions.
	Models.deleteModel = function(DeleteOptions, callback)
	{
		var self = this;

		// No options defined:
		if (DeleteOptions === undefined)
		{
			return false;
		}


		// [TODO] Validate parameters before sending. (is everything included?)
		if (DeleteOptions.uuid === undefined || DeleteOptions.uuid.length === 0)
		{
			return false;
		}

		// Prepare options for our format.
		var deleteoptions = {
			"type": "deleterun"
		};

		deleteoptions.parameters = {};
		deleteoptions.uuid = DeleteOptions.uuid;


		$.ajax(
		{
			url: self.BaseURL + "/deleterun/",
			data: deleteoptions,
			method: "GET" // Should be a POST later


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
