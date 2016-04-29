// globals: nock
(function () {
  "use strict";
  var fetch = require("node-fetch");
  var nock = require("nock");
  var assert = require("chai").assert;
  // Load jsdom
  var jsdom = require("jsdom").jsdom;

  // You might want to do this per test....
  // Create a document
  var document = jsdom("", {});
  // Get the corresponding window
  var window = document.defaultView;
  // Load jquery with that window
  var $ = require("jquery")(window);

  // Function for throwing an error
  function throwError(done, errorMsg) {
    try {
      assert.isOk(false, errorMsg);
    } catch (e) {
      done(e);
    }
  }

  describe("Example of nock", function() {
    describe("How to fake a response", function() {

      // Call the nock using jQuery
      it("Call nock using jQuery", function(done) {
        // Define a fake server that responds with json data
        nock("http://0.0.0.0")
          .defaultReplyHeaders({
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          })
          .post("/scene/create", {
            name: "nock-test"
          })
          .reply(200, {
            result: "ok"
          });

        // Post a request using $.ajax, this should return "result.ok"
        $.ajax({
          url: "http://0.0.0.0/scene/create",
          method: "POST",
          data: { name: "nock-test" }
        })
          .done(function(data) {
            assert.equal(data.result, "ok");
          })
          .fail(function() {
            throwError(done, "Request failed!");
          });

        // Calling the nock again should fail
        $.ajax({
          url: "http://0.0.0.0/scene/create",
          method: "POST",
          data: { name: "nock-test" }
        })
          .done(function() {
            throwError(done, "Request should work only once");
          })
          .fail(function() {
            done();
          });
      });

      // Create a MessageSceneCreate without options, we should have an empty options object (null)
      it("Should be possible to call nock twice", function(done) {

        // Define a fake server that responds with json data
        nock("http://0.0.0.0")
          .defaultReplyHeaders({
            "Content-Type": "application/json"
          })
          .post("/scene/create", {
            name: "nock-test"
          })
          .reply(200, {
            result: "ok"
          });


        // Post a request, this should return "result.ok"
        // Note that we use the modern fetch api and not the $.ajax api from jquery.
        // $.ajax is not supported.
        // https://github.com/node-nock/nock/issues/527
        // "Nock only mocks the node HTTP client, and jQuery is not using that..."
        fetch("http://0.0.0.0/scene/create", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: "nock-test"
          })
        })
          .then(function(resp) {
            return resp.json();
          })
          .then(function(data) {
            assert.equal(data.result, "ok");
          })
          .catch(function(error) {
            console.error("request failed with error", error);
            done();
          });


        // Now the second thing you should be aware off
        // notice the big "READ THIS" in the documentation
        // https://github.com/node-nock/nock#read-this---about-interceptors
        // After request is intercepted that interceptor is removed. It only works for 1 request.
        // So the 2nd time it should return an error
        fetch("http://0.0.0.0/scene/create", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: "nock-test"
          })
        })
          .then(function(resp) {
            assert.fail("request should work only once");
            return resp.json();
          })
          .then(function(data) {
            console.log("got unexpected data", data);
            assert.fail("request should work only once");
            done();
          })
          .catch(function(error) {
            // We should have some error (something truthy will do).
            assert.isOk(error, "we got an expected error");
            done();
          });

      });
    });
  });
}());
