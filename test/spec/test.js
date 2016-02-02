
/* global chai */
(function () {
  'use strict';
  
	// To simulate JQuery namespace
  global.$ = { };
	
	// Include our files (this was needed for mocha, not sure for Chai?)
	include_file(__dirname + "/../../app/scripts/models.js");
	include_file(__dirname + "/../../app/scripts/ui.js");
	include_file(__dirname + "/../../app/scripts/inputvalidation.js");
	include_file(__dirname + "/../../bower_components/validator-js/validator.js");

	
	// http://stackoverflow.com/questions/21421701/javascript-test-mocha-with-import-js-file
	function include_file(path)
	{
		var fs = require('fs');
		var vm = require('vm');

		var code = fs.readFileSync(path);

		vm.runInThisContext(code);

	}


  if (typeof require !== 'undefined') {
    // stuff to test without a browser
    var assert = require('chai').assert;
    var nock = require('nock');
    var fetch = require('node-fetch');
    nock('https://delft3d-gt')
          .post('/runs')
          .reply(200, {
            uuid: 'XXXX-XXXX'
          });

  } else {
    assert = chai.assert;
    fetch = window.fetch;
  }
  describe('If we are on the create run page', function () {
    describe('And we press the create button ', function () 
    {
      it('should send a json message to the server ', function () {
        assert(true, 'implement json message format');
      });

      it('should contain a name in the message', function () {
        assert(true, 'implement and test name in format');
      });

      it('should have a timestep parameter (dt) with a numeric value', function () {
        assert(true, 'implement and test dt in format');
      });

      it('should be posted to the server, resulting in a  uuid', function(done){
        fetch('https://delft3d-gt/runs', {
          method: 'POST',
          body: JSON.stringify({
            'name': 'f34'
          })
        })
          .then(function(response){
            return response.json();
          })
          .catch(function(error){
            done(error);
          })
          .then(function(data) {
            assert.ok(data.uuid, 'got some data with a uuid');
            done();
          })
          .catch(function(error){
            done(error);
          });
        });
    });
	});


	describe('runModel', function() 
	{
	  it('Check success response', function(done) 
	  {
		var models = new Models();

	  	var config =
			{
				"BaseURL": "http://136.231.174.53:8000"
			};
			
	 		models.setConfiguration(config);

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
	     var result = models.runModel(ScenarioOptions, ModelOptions, fetchCallback);
	     assert.equal(result, true);
	  });

	 it('Check response when missing data', function(done) 
	  {

		var models = new Models();
		
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

	    	
			var result = models.runModel(ScenarioOptions, ModelOptions, fetchCallback);
	     
			// We expect a false here - as we miss a parameter.
			assert.equal(result, false); 

			done();
	  });
	});


})();
