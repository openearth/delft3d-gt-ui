/* global chai */
(function () {
  'use strict';
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
    describe('And we press the create button ', function () {
      it('should send a json message to the server ', function () {
        assert(false, 'implement json message format');
      });
      it('should contain a name in the message', function () {
        assert(false, 'implement and test name in format');
      });
      it('should have a timestep paramater (dt) with a numeric value', function () {
        assert(false, 'implement and test dt in format');
      });
      it('should be posted to the server, resulting in a  uuid', function(done){
        fetch('https://delft3d-gt/runs', {
          method: 'POST',
          body: JSON.stringify({
            'name': 'f34'
          })
        })
          .then(function(response){
            console.log(response);
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
})();
