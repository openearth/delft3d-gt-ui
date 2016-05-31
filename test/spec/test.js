/* global chai  */

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

  // load the components
  var ImageAnimation = require("../../app/scripts/components/imageanimation.js").ImageAnimation;

  // this is needed because this object is used as a global variable
  global.ImageAnimation = ImageAnimation;
  var ModelDetails = require("../../app/scripts/components/modeldetails.js").ModelDetails;
  var ModelCreate = require("../../app/scripts/components/modelcreate.js").ModelCreate;
  var ModelList = require("../../app/scripts/components/modellist.js").ModelList;
  var ScenarioCreate = require("../../app/scripts/components/scenariobuilder.js").ScenarioCreate;
  var ScenarioList = require("../../app/scripts/components/scenariolist.js").ScenarioList;
  var HomeView = require("../../app/scripts/components/home.js").HomeView;

  // why is this necessary....
  var factorToArray = require("../../app/scripts/components/scenariobuilder.js").factorToArray;

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
    describe("If we can query the model list", function() {

      // This test is now working using the filteringPath option.
      // When testing get request, this seems to be the solution.
      it("Should be possible list models", function(done) {
        nock("http://0.0.0.0")
          .defaultReplyHeaders({
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          })
          .log(console.log)
          .filteringPath(function() {
            return "/api/v1/models/";
          })
          .get("/api/v1/models/")
          .reply(200, [
            {
              id: 1,
              name: "Run 1"
            }
          ]);

        global.fetchModels()
          .then(function(data) {
            console.log("data", data);
            assert.isOk(data, "we have some data");
            done();
          })
          .catch(function(e) {
            console.log(e);
            // rethrow error to capture it and avoid time out
            try {
              throw e;
            } catch (exc) {
              done(exc);
            }
          });

      });
    });



  });


  // Testing MessageSceneList messages
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
