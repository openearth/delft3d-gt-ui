/*jshint quotmark: double */
(function () {
  'use strict';

  describe('Give it some context', function () {
    describe('maybe a bit more context here', function () {
      it('should run here few assertions', function () {

      });
    });
  });


	describe('Example tests 1', function () {
    describe('Check if values add up', function () {
      it('1+1 = ?', function () {

      		assert.equal(3, Models.MochaTest( 1, 2 ) );

      });
    });
  });

})();
