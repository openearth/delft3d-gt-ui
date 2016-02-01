
(function () {
  'use strict';
	
	var assert = require('assert');
	//var expect = require('expect');
  //var jsdom = require('jsdom');
	// In global space:
	global.$ = { };



console.log("bla");

include_file(__dirname + "/../../app/scripts/app.models.js");
include_file(__dirname + "/../../app/scripts/app.ui.js");
include_file(__dirname + "/../../bower_components/validator-js/validator.js");

	
// http://stackoverflow.com/questions/21421701/javascript-test-mocha-with-import-js-file
function include_file(path)
{
	var fs = require('fs');
	var vm = require('vm');

	var code = fs.readFileSync(path);

	vm.runInThisContext(code);

}


  var config =
	{
		"BaseURL": "http://136.231.174.53:8000"
	};

  Models.setConfiguration(config);

	describe('Models', function () {
    describe('Check if values add up', function () {
      it('1+1 = ?', function () {

      		assert.equal(3, Models.MochaTest( 1, 2 ) );
      		assert.equal(7, Models.MochaTest( 2, 5 ) );

      });
    });
  });


describe('runModel', function() 
{
  it('Check success response', function(done) 
  {


  	// Expected input:
		var ScenarioOptions = {};
		var ModelOptions = {};

		// This is also what we check again, to see if this is what went to the ajax call.
		ScenarioOptions.runid  = "test"; //"run1";
		ScenarioOptions.author = "placeholder";
		ModelOptions.timestep  = 20;


  	// Expected output:
    var simulatedAjaxResponse = 
		{
				"type": "createresult",
				"status": 
				{
					"reason": "",
				 	"code": "success"
				}, 
				"id": "141ca2fc-f08a-4dcf-9444-bd1e02efb629"
		}

		// Ajax simulate code. Does not perform actual requests.
		$.ajax = function(ajaxOpts) 
		{
			checkAjaxOptions(ajaxOpts);

			var doneCallback = ajaxOpts.done;
			doneCallback(simulatedAjaxResponse);
		};

		function checkAjaxOptions(ajaxOpts)
		{
 				assert.equal(ajaxOpts.data.type, "startrun");
      	assert.equal(ajaxOpts.data.name, ScenarioOptions.runid);
      	assert.equal(ajaxOpts.data.dt, ModelOptions.timestep);
		}

    function fetchCallback(response) 
    {
      assert.equal(response.type, "createresult");
      assert.equal(response.status.code, "success");
      assert(response.id != undefined && response.id.length > 0);

      done();
    };


    	// Check if the run model returns false or true. False is if the input was not acceptable.
     var result = Models.runModel(ScenarioOptions, ModelOptions, fetchCallback);
     assert.equal(result, true);
  });


 it('Check response when missing data', function(done) 
  {


  	// Expected input:
		var ScenarioOptions = {};
		var ModelOptions = {};

		// This is also what we check again, to see if this is what went to the ajax call.
		ScenarioOptions.runid  = ""; //"run1";
		ScenarioOptions.author = "placeholder";
		ModelOptions.timestep  = 20;


  	// Expected output:
    var simulatedAjaxResponse = 
		{
				"type": "createresult",
				"status": 
				{
					"reason": "",
				 	"code": "success"
				}, 
				"id": "141ca2fc-f08a-4dcf-9444-bd1e02efb629"
		}

		// Ajax simulate code. Does not perform actual requests.
		$.ajax = function(ajaxOpts) 
		{
			checkAjaxOptions(ajaxOpts);

			var doneCallback = ajaxOpts.done;
			doneCallback(simulatedAjaxResponse);
		};

		function checkAjaxOptions(ajaxOpts)
		{
 				assert.equal(ajaxOpts.data.type, "startrun");
      	assert.equal(ajaxOpts.data.name, ScenarioOptions.runid);
      	assert.equal(ajaxOpts.data.dt, ModelOptions.timestep);
		}

    function fetchCallback(response) 
    {
    };

    	
		var result = Models.runModel(ScenarioOptions, ModelOptions, fetchCallback);
     
		// We expect a false here - as we miss a parameter.
		assert.equal(result, false); 

		done();
  });

});


})();
