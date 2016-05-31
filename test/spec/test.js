/* global chai , MessageSceneCreate, MessageSceneChangeState, MessageSceneDelete, MessageSceneList */

(function() {
  "use strict";

  // imports
  var path = require("path");

  // We use a setInterval mock function, otherwise setIntervals will cause Mocha to never stop!
  global.setInterval = function(callback, time) {
    console.log("setInterval override " + callback + " time " + time);
  };


  // http://stackoverflow.com/questions/21421701/javascript-test-mocha-with-import-js-file
  function includeFile(pathName) {
    var fs = require("fs");
    var vm = require("vm");

    var code = fs.readFileSync(pathName);

    vm.runInThisContext(code);
  }


  // Required for JQuery:
  var jsdom = require("jsdom").jsdom;

  // You might want to do this per test....
  // Create a document

  /* eslint-disable quotes */
  global.document = jsdom('<!doctype html><html><body><div id="app"></div><div id="template-container"></div></body></html>', {});
  /* eslint-enable quotes */

  // Get the corresponding window
  global.window = document.defaultView;

  global.navigator = {
    userAgent: "You're own dedicated browser"
  };


  // we also need a history and location for #/urls
  global.history = require("history").createHistory();
  global.location = global.history.createLocation();
  global.location.replace = function(location) {
    console.log("ignoring replace, implemented in history >= 3.0", location);
  };

  // Load jquery with that window, required for app.js
  global.$ = require("jquery")(window);

  global._ = require("lodash");

  global.Vue = require("vue");
  global.VueRouter = require("vue-router");

  // Include our files (this was needed for mocha, not sure for Chai?)
  // includeFile(path.join(__dirname, "/../../app/scripts/models.js"));

  includeFile(path.join(__dirname, "/../../app/scripts/ui.js"));
  includeFile(path.join(__dirname, "/../../app/scripts/inputvalidation.js"));
  includeFile(path.join(__dirname, "/../../bower_components/validator-js/validator.js"));

  includeFile(path.join(__dirname, "/../../app/scripts/data/message-scene-create.js"));
  includeFile(path.join(__dirname, "/../../app/scripts/data/message-scene-changestate.js"));
  includeFile(path.join(__dirname, "/../../app/scripts/data/message-scene-delete.js"));
  includeFile(path.join(__dirname, "/../../app/scripts/data/message-scene-list.js"));

  // load the application
  var ImageAnimation = require("../../app/scripts/components/imageanimation.js").ImageAnimation;

  global.ImageAnimation = ImageAnimation;

  var ModelDetails = require("../../app/scripts/components/modeldetails.js").ModelDetails;
  var ModelCreate = require("../../app/scripts/components/modelcreate.js").ModelCreate;
  var ModelList = require("../../app/scripts/components/modellist.js").ModelList;
  var ScenarioCreate = require("../../app/scripts/components/scenariobuilder.js").ScenarioCreate;
  var factorToArray = require("../../app/scripts/components/scenariobuilder.js").factorToArray;
  var ScenarioList = require("../../app/scripts/components/scenariolist.js").ScenarioList;

  var HomeView = require("../../app/scripts/components/home.js").HomeView;


  // why is this necessary....
  _.assign(global, require("../../app/scripts/models.js"));
  _.assign(global, require("../../app/scripts/templates.js"));
  _.assign(global, require("../../app/scripts/scenarios.js"));

  require("../../app/scripts/app.js");


  // In testing we override the URL domain name. Otherwise nock cannot work. Nock does NOT support relative paths.
  // Using this, we can use http://0.0.0.0 in the nock.
  global.$.ajaxPrefilter(function(options) {
    options.url = "http://0.0.0.0" + (options.url);
  });


  if (typeof require !== "undefined") {

    // stuff to test without a browser
    var assert = require("chai").assert;
    var sinon = require("sinon");

    //console.log(jsdom);

    var nock = require("nock");


  } else {
    assert = chai.assert;
    //fetch = window.fetch;
  }

  describe("Testing data exchange with api", function() {
    describe("If we can query the scenario list", function() {

      // This test is now working using the filteringPath option.
      // When testing get request, this seems to be the solution.
      it("Should be possible list scenarios", function(done) {
        nock("http://0.0.0.0")
          .defaultReplyHeaders({
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          })
          .log(console.log)
          .filteringPath(function() {
            return "/scenario/list";
          })
          .get("/scenario/list")
          .reply(200, {
          });

        global.fetchScenarios()
          .then(function(data) {
            assert.isOk(data, "we have some data");
            done();
          })
          .catch(function(e) {
            console.log(e);
            // rethrow error to capture it and avoid time out
            try {
              throw new Error("exception from fetching scenarios" + JSON.stringify(e));
            } catch (exc) {
              done(exc);
            }
          });

      });
    });


    describe("MessageSceneCreate", function() {
      // Create a MessageSceneCreate without options, we should have an empty options object (null)
      it("Test scene creation - without name", function() {

        var msc = new MessageSceneCreate({});

        assert(msc.options == null, "MessageSceneCreate should be null");
      });



      // Create a MessageSceneCreate without options, we should have an empty options object (null)
      it("Test scene creation - with name", function() {
        var options = {
          name: "Model to create"
        };

        var msc = new MessageSceneCreate(options);

        assert(msc.options.name === options.name, "MessageSceneCreate name is set");
      });


      it("Test scene creation - check create request - ok", function(done) {
        var options = {
          name: "Model to create"
        };

        nock("http://0.0.0.0")
          .defaultReplyHeaders({
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          })
          .post("/scene/create", {
            // We have to match these post fields:
            // If it does not, we get an error in the report (which is what we want then?)
            name: options.name
          })
          .reply(200, {
            scene: {
              "info": "",
              "name": options.name,
              "simulationtask": null,
              "workingdir": "",
              "postprocessingtask": null,
              "state": "",
              "processingtask": null,
              "fileurl": "",
              "id": 30
            }
          });

        var msc = new MessageSceneCreate(options);

        msc.onErrorCallback(function(errorInfo) {
          // Somehow we need a try catch blog for asserts?
          try {
            console.log(errorInfo.status);
            assert(errorInfo.status !== "error", "Model status is: error - Name does not match?");
          } catch (x) {
            done(x);
          }
        });

        // Execute AJAX call to remote server to get list of models.
        msc.executeRequest(function(data) {
          assert(data.scene.name === options.name, "model name is ok");
          done();
        });
      });
    });


    // Testing MessageSceneChangeState messages
    describe("MessageSceneChangeState", function() {


      // Create a MessageSceneCreate without options, we should have an empty options object (nulll)
      it("MessageSceneChangeState - Create instance without options", function() {

        var mscs = new MessageSceneChangeState();

        assert(mscs.modelid == null, "MessageSceneChangeState modelid should be null");
      });

      // Create a MessageSceneCreate without options, we should have an empty options object (nulll)
      it("MessageSceneChangeState - Create instance with string parameter", function() {

        var mscs = new MessageSceneChangeState("notallowed");

        assert(mscs.modelid == null, "MessageSceneChangeState modelid should be null");
      });


      it("MessageSceneChangeState - Check sceneid being sent", function(done) {

        // Id of the scene we will start:
        var startid = 1;
        var mscs = new MessageSceneChangeState(startid);

        nock("http://0.0.0.0")
          .defaultReplyHeaders({
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          })
          .post("/scene/start", {
            // We have to match these post fields:
            // If it does not, we get an error in the report (which is what we want then?)
            id: "" + startid
          })
          .reply(200, {
            "status": "started"
          });

        mscs.onErrorCallback(function(errorInfo) {
          // Somehow we need a try catch blog for asserts?
          try {
            assert(errorInfo.status !== "error", "MessageSceneChangeState did not make correct AJAX call.");
          } catch (x) {
            done(x);
          }
        });

        // Execute AJAX call to remote server to get list of models.
        mscs.executeRequest(function(data) {
          assert(data.status === "started", "MessageSceneChangeState status = started ok");
          done();
        });
      });
    });

  });

  // Testing MessageSceneChangeState messages
  describe("MessageSceneDelete", function() {


    // Create a MessageSceneCreate without options, we should have an empty options object (null)
    it("MessageSceneDelete - Create instance without options", function() {

      var msd = new MessageSceneDelete();

      assert(msd.modelid == null, "MessageSceneDelete modelid should be null");
    });

    // Create a MessageSceneCreate without options, we should have an empty options object (null)
    it("MessageSceneDelete - Create instance with string parameter", function() {

      var msd = new MessageSceneDelete("notallowed");

      assert(msd.modelid == null, "MessageSceneDelete modelid should be null");
    });


    it("MessageSceneDelete - Check sceneid being sent", function(done) {

      // Id of the scene we will start:
      var deleteid = 1;
      var msd = new MessageSceneDelete(deleteid);

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .post("/scene/delete", {
          // We have to match these post fields:
          // If it does not, we get an error in the report (which is what we want then?)
          id: "" + deleteid
        })
        .reply(200, {
          "status": "deleted"
        })
      // Otherwise we return an 500. The postdata did not match.
        .post("/scene/delete")
        .reply(500, {
          status: "error"
        });


      msd.onErrorCallback(function(errorInfo) {
        // Somehow we need a try catch blog for asserts?
        try {
          assert(errorInfo.status !== "error", "MessageSceneDelete did not make correct AJAX call.");
        } catch (x) {
          done(x);
        }
      });

      // Execute AJAX call to remote server to get list of models.
      msd.executeRequest(function(data) {
        assert(data.status === "deleted", "MessageSceneDelete status = started ok");
        done();
      });
    });
  });


  // Testing MessageSceneList messages
  describe("MessageSceneList", function() {

    it("MessageSceneList - Check if request is sent correctly", function(done) {

      var msl = new MessageSceneList();

      nock("http://0.0.0.0")

        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .get("/scene/list")
        .reply(200, {});



      msl.onErrorCallback(function() {
        // Somehow we need a try catch blog for asserts?
        try {
          assert(false, "MessageSceneList did not make correct AJAX call.");
        } catch (x) {
          done(x);
        }
      });

      // Execute AJAX call to remote server to get list of models.
      msl.executeRequest(function() {
        //assert(data.status === "deleted", "MessageSceneList status = started ok");
        done();
      });
    });

    // This one is todo!
    it("MessageSceneList - Check if we get valid scenes", function(done) {

      var msl = new MessageSceneList();

      nock("http://0.0.0.0")

        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .get("/scene/list")
        .reply(200, {
          "paginator": null,
          "scene_list": [{
            "info": "",
            "name": "My Scene #1",
            "simulationtask": {
              "state": "PENDING",
              "state_meta": {},
              "uuid": "2a0bca03-47c2-4f3f-9901-4164261134ff"
            },
            "workingdir": "",
            "postprocessingtask": null,
            "state": "",
            "processingtask": {
              "state": "PENDING",
              "state_meta": {},
              "uuid": "af15e2d8-6033-4c09-bfb1-2fc7cb825b80"
            },
            "fileurl": "",
            "id": 29
          }],
          "page_obj": null,
          "is_paginated": false
        });



      msl.onErrorCallback(function() {
        // Somehow we need a try catch blog for asserts?
        try {
          assert(false, "MessageSceneList did not make correct AJAX call.");
        } catch (x) {
          done(x);
        }
      });

      // Execute AJAX call to remote server to get list of models.
      msl.executeRequest(function(data) {
        //console.log(data);
        assert(data.scenes.length === 1, "Scenes has 1 item. OK");
        assert(data.scenes[0].name === "My Scene #1", "Scene has correct name item. OK");
        assert(data.scenes[0].id === 29, "Scene has correct id. OK");

        done();
      });
    });

  });
  describe("Components", function() {
    it("Is possible to instantiate component ModelCreate", function(done) {

      var modelCreate = new ModelCreate();

      assert.isOk(modelCreate);
      done();
    });

    it("Is possible to instantiate component ModelDetails", function(done) {

      var modelDetails = new ModelDetails();

      assert.isOk(modelDetails);
      done();
    });
  });

  describe("Scenario builder", function() {
    it("Is possible to create a scenarioBuilder", function(done) {
      var scenarioCreate = new ScenarioCreate();

      console.log("routing", scenarioCreate.$route);
      assert.isOk(scenarioCreate);
      done();
    });
    it("Should be possible to convert a single value to a tag array", function(done) {
      var array = factorToArray({
        factor: true,
        value: 0.3,
        type: "numeric"
      });

      assert.equal(0.3, array[0]);
      done();
    });
    it("Should be possible to convert a comma separated string to a tag array", function(done) {
      var array = factorToArray({
        factor: true,
        value: "0,2,3",
        type: "numeric"
      });

      assert.equal(0, array[0]);
      done();
    });
    it("Should be possible to check a value using the custom max validator", function(done) {
      var scenarioCreate = new ScenarioCreate();

      // check if we get an invalid error if we pass 0
      var valid = scenarioCreate.$options.validators.min("0,2,3", 1);

      assert.isFalse(valid);
      done();
    });
    it("Should be possible get the total number of runs", function(done) {
      var scenarioCreate = new ScenarioCreate();

      // check if we get an invalid error if we pass 0
      scenarioCreate.scenarioConfig = scenarioCreate.prepareScenarioConfig({
        "sections": [
          {
            "variables": [
              {
                id: "var1",
                value: "0,3",
                default: "0,3",
                type: "numeric",
                factor: true
              }
            ]
          }
        ]
      });
      assert.equal(2, scenarioCreate.totalRuns);
      done();
    });
    it("Should be possible to prepare a scenario", function(done) {
      var scenarioCreate = new ScenarioCreate();

      // empty template
      var template = {};

      scenarioCreate.selectTemplate(template);

      assert.isOk(scenarioCreate.scenarioConfig);

      done();
    });
    it("Should be possible to updte with query parameters", function(done) {
      var scenarioCreate = new ScenarioCreate();

      scenarioCreate.updateWithQueryParameters();

      assert.isOk(scenarioCreate.scenarioConfig);

      done();
    });
    it("Should be possible to submit a scenario", function(done) {
      var scenarioCreate = new ScenarioCreate();

      scenarioCreate.submitScenario();

      assert.isOk(scenarioCreate.scenarioConfig);

      done();
    });
    it("Should be possible to prepare a scenario", function(done) {
      var scenarioCreate = new ScenarioCreate();

      scenarioCreate.prepareScenarioConfig({
        "sections": [
          {
            "variables": [
              {
                id: "var1",
                default: 0,
                factor: true
              }
            ]
          }
        ]
      });

      assert.isOk(scenarioCreate.scenarioConfig);

      done();
    });
  });

  describe("Scenarios", function() {
    it("Is possible to create a scenarioList", function(done) {
      var scenarioList = new ScenarioList();

      console.log("routing", scenarioList.$route);
      assert.isOk(scenarioList);
      done();
    });
    it("Is possible to get a default run", function(done) {
      var scenarioList = new ScenarioList();

      assert(scenarioList.defaultRun === -1);
      done();
    });

    it("Is possible to use the scenario in a router", function(done) {
      Vue.config.debug = true;
      Vue.use(VueRouter);

      var App = Vue.extend({});
      var router = new VueRouter();

      router.map({
        "/scenarios/:scenarioids": {
          component: ScenarioList
        }
      });

      router.start(App, "#app");
      router.go("/scenario/1");
      console.log("children", App.$children);
      done();
    });
    it("Is possible to clone a scenario", function(done) {

      assert.isOk(true);
      done();
    });
  });

  describe("ModelDetails", function() {
    var modelDetails = new ModelDetails();

    it("Should be possible to start a model", function(done) {
      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .post("/scene/start", {
        })
        .reply(200, {
        });
      modelDetails.startModel();
      done();
    });

    it("Should be possible to download files", function(done) {
      var windowSpy = sinon.spy(window, "open");

      // this should open a new window
      modelDetails.downloadFiles();

      // did it?
      sinon.assert.calledOnce(windowSpy);

      done();

    });


  });


  describe("ImageAnimation", function() {
    var imageAnimation = new ImageAnimation();

    imageAnimation.model = { };

    it("Should be possible to stop image frames", function(done) {

      imageAnimation.stopImageFrame();
      done();

    });
    it("Should be possible to play image frames the imageFrame", function(done) {

      imageAnimation.playImageFrame();
      done();

    });
    it("Should be possible to change the imageFrame", function(done) {
      imageAnimation.nextImageFrame();
      done();

    });


  });


  // Testing App
  describe("App", function() {


    it("can I initialized the application", function(done) {
      var App = Vue.extend({});

      Vue.use(VueRouter);
      var router = new VueRouter();

      router.map({
        "/models/:id": {
          component: ModelDetails
        },
        "/scenarios/create": {
          component: ScenarioCreate
        },
        "/models": {
          component: ModelList
        },
        "/": {
          component: HomeView
        }
      });
      router.start(App, "#app");

      assert(App !== undefined, "app created");
      done();
    });

    // This test doesn't work, since it gets stuck when loading the main template.
    it("App - LoadTemplate - Check if mock template is added to DOM", function(done) {

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "text/html",
          "Access-Control-Allow-Origin": "*"
        })
        .log(console.log)
        .get("/templates/templates.html")
        .reply(200, "<div>template-ok</div>");

      // TODO: put this code in some app level promise
      $("#template-container").load(
        "/templates/templates.html",
        function() {
          var html = global.$("#template-container").html();

          /* eslint-disable quotes */
          var check = '<div>template-ok</div>';

          /* eslint-enable quotes */

          // This works better than the assert:
          try {
            assert.equal(check, html, "HTML template does not match");
            done();
          } catch (e) {
            done(e);
          }

        });
    });



  });


})();
