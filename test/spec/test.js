
(function () {
  'use strict';
	
	var assert = require('assert');

include_file(__dirname + "/../../app/scripts/app.models.js");
include_file(__dirname + "/../../app/scripts/app.ui.js");

// http://stackoverflow.com/questions/21421701/javascript-test-mocha-with-import-js-file
function include_file(path)
{
	var fs = require('fs');
	var vm = require('vm');

	var code = fs.readFileSync(path);
	vm.runInThisContext(code);

}


  describe('Give it some context', function () {
    describe('maybe a bit more context here', function () {
      it('should run here few assertions', function () {

      });
    });
  });


	describe('Models', function () {
    describe('Check if values add up', function () {
      it('1+1 = ?', function () {

      		assert.equal(3, Models.MochaTest( 1, 2 ) );
      		assert.equal(7, Models.MochaTest( 2, 5 ) );

      });
    });
  });

})();
