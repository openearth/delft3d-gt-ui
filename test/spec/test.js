/* global chai  */
(function() {
  "use strict";

  // We use a setInterval mock function, otherwise setIntervals will cause Mocha to never stop!
  global.setInterval = function() {
    // args: callback, time
    // "setInterval override " + callback + " time " + time
  };


  // We need a fake dom, history and window
  var jsdom = require("jsdom").jsdom;

  // You might want to do this per test...
  // Create a document
  /* eslint-disable quotes */

  global.document = jsdom('<!doctype html><html><body><div id="app"><div id="model-create"></div><scenario-builder id="scenario-builder"></scenario-builder><div id="model-details"></div></div><div id="template-container"></div></body></html>', {});

  /* eslint-enable quotes */

  // Get the corresponding window
  var window = document.defaultView;

  // Load jquery with that window
  // Don't put this after global.document (if a global document exists $ won't work)
  var $ = require("jquery")(window);

  // The next steps assume some kind of dom is available
  global.document = document;
  global.window = window;

  // some more settings
  var navigator = {
    userAgent: "You're own dedicated browser"
  };

  global.navigator = navigator;

  // This assumes a navigator is present
  // we also need a history and location for #/urls
  var history = require("history").createHistory();
  var location = history.createLocation();

  global.history = history;
  global.location = location;
  location.replace = function(newLocation) {
    console.log("ignoring replace, implemented in history >= 3.0", newLocation);
  };

  var _ = require("lodash");
  var Vue = require("vue");
  var VueRouter = require("vue-router");

  // export to global;
  global.$ = $;
  global._ = _;
  global.Vue = Vue;
  global.VueRouter = VueRouter;

  // load the components
  var ImageAnimation = require("../../app/scripts/components/imageanimation.js").ImageAnimation;

  // this is needed because this object is used as a global variable
  // used by other component
  global.ImageAnimation = ImageAnimation;
  var ModelDetails = require("../../app/scripts/components/modeldetails.js").ModelDetails;

  // used by other component
  global.ModelDetails = ModelDetails;

  var ModelCreate = require("../../app/scripts/components/modelcreate.js").ModelCreate;
  var ModelList = require("../../app/scripts/components/modellist.js").ModelList;

  // used by other component
  global.ModelList = ModelList;

  var ScenarioCreate = require("../../app/scripts/components/scenariobuilder.js").ScenarioCreate;
  var ScenarioList = require("../../app/scripts/components/scenariolist.js").ScenarioList;
  var SearchDetails = require("../../app/scripts/components/searchdetails.js").SearchDetails;
  var UserDetails = require("../../app/scripts/components/userdetails.js").UserDetails;

  // used by other component
  global.UserDetails = UserDetails;
  global.SearchDetails = SearchDetails;
  global.ScenarioList = ScenarioList;

  var FinderColumns = require("../../app/scripts/components/findercolumns.js").FinderColumns;
  var SearchColumns = require("../../app/scripts/components/searchcolumns.js").SearchColumns;

  // why is this necessary....
  var factorToArray = require("../../app/scripts/components/scenariobuilder.js").factorToArray;

  _.assign(global, require("../../app/scripts/models.js"));
  _.assign(global, require("../../app/scripts/templates.js"));
  _.assign(global, require("../../app/scripts/scenarios.js"));


  // In testing we override the URL domain name. Otherwise nock cannot work. Nock does NOT support relative paths.
  // Using this, we can use http://0.0.0.0 in the nock.
  global.$.ajaxPrefilter(function(options) {
    options.url = "http://0.0.0.0" + (options.url);
  });

  // stuff to test without a browser
  var sinon = require("sinon");
  var nock = require("nock");
  var assert = require("chai").assert;

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
      it("Should be possible get a model by id", function(done) {
        nock("http://0.0.0.0")
          .defaultReplyHeaders({
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          })
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

        global.fetchModel(1)
          .then(function(data) {
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
          component: FinderColumns
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

  describe("Components", function() {
    it("Is possible to instantiate component ModelCreate", function(done) {

      var modelCreate = new ModelCreate({
      });

      assert.isOk(modelCreate);
      done();
    });

    it("Is possible to instantiate component ModelDetails", function(done) {
      var modelDetails = new ModelDetails({
      });

      assert.isOk(modelDetails);
      done();
    });

    it("Is possible to instantiate component ScenarioList", function(done) {
      var scenarioList = new ScenarioList({
      });

      assert.isOk(scenarioList);
      done();
    });

    it("Is possible to instantiate component ModelDetails", function(done) {
      var modelDetails = new ModelDetails({
      });

      assert.isOk(modelDetails);
      done();
    });
    it("Is possible to instantiate component ScenarioBuilder", function(done) {
      var scenarioCreate = new ScenarioCreate({
      });

      assert.isOk(scenarioCreate);
      done();
    });
    it("Is possible to create a search details", function(done) {
      var searchDetails = new SearchDetails();

      assert.isOk(searchDetails);
      done();
    });
    it("Is possible to create a scenarioBuilder", function(done) {
      var scenarioCreate = new ScenarioCreate({
      });

      assert.isOk(scenarioCreate);
      done();
    });
    it("Is possible to create a search columns", function(done) {
      var searchColumns = new SearchColumns();

      assert.isOk(searchColumns);
      done();
    });
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
  describe("Search list", function() {
    it("Is possible to create a search columns", function(done) {
      var searchColumns = new SearchColumns();

      assert.isOk(searchColumns);
      done();
    });
  });
  describe("Finder columns", function() {
    it("Is possible to create a three column layout", function(done) {
      var finderColumns = new FinderColumns();

      assert.isOk(finderColumns);
      done();
    });
  });
  describe("Search details", function() {
    it("Is possible to create a search details", function(done) {
      var searchDetails = new SearchDetails();

      assert.isOk(searchDetails);
      done();
    });
    it("Is possible to get modelEngines", function(done) {
      var searchDetails = new SearchDetails();

      searchDetails.templates = [{
        sections: [{
          variables: [{
            id: "engine",
            default: "Delft3D"
          }]
        }]
      }];

      assert.deepEqual(searchDetails.modelEngines, ["Delft3D"]);
      done();
    });
    it("Is possible to get parameters", function(done) {
      var searchDetails = new SearchDetails();

      searchDetails.templates = [{
        sections: [{
          variables: [{
            id: "riverwidth",
            validators: {
              min: 3,
              max: 10
            }
          }]
        }]
      }];

      var comp = {
        riverwidth: {
          id: "riverwidth",
          min: 3,
          max: 10
        }
      };

      assert.deepEqual(searchDetails.parameters, comp);
      done();
    });
    it("Is possible to build a request", function(done) {
      var searchDetails = new SearchDetails();

      // no values set
      var comp = {
        data: {
          parameters: [
            "riverwidth,null",
            "riverdischarge,null",
            "engines,"
          ],
          shared: [],
          template: []
        },
        dataType: "json",
        traditional: true,
        url: "/api/v1/scenes/"
      };

      assert.deepEqual(searchDetails.buildRequest(), comp);
      done();
    });
  });
  describe("User details", function() {
    it("Is possible to create a user details", function(done) {
      var userDetails = new UserDetails();

      assert.isOk(userDetails);
      done();
    });
  });

  describe("Scenario builder", function() {
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
      var scenarioCreate = new ScenarioCreate({
      });

      // check if we get an invalid error if we pass 0
      var valid = scenarioCreate.$options.validators.min("0,2,3", 1);

      assert.isFalse(valid);
      done();
    });
    it("Should be possible get the total number of runs", function(done) {
      var scenarioCreate = new ScenarioCreate({
      });

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
      var scenarioCreate = new ScenarioCreate({
      });

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
      var correctReply = false;

      modelDetails.$parent = {};
      modelDetails.$parent.$broadcast = function() {
      };

      modelDetails.model.id = 4;

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .post("/api/v1/scenes/4/start/")
        .reply(200, function() {
          correctReply = true;
          return {};
        });

      modelDetails.startModel();

      // Make sure the nock server had the time to reply
      window.setTimeout(function() {
        try {
          assert(correctReply === true, "Nock server did not reach reply");
          done();
        } catch (e) {
          done(e);
        }
      }, 100);
    });

    it("Should be possible to export a model", function(done) {
      var correctReply = false;

      modelDetails.model.id = 4;

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .post("/api/v1/scenes/4/start/", {
          workflow: "export"
        })
        .reply(200, function() {
          correctReply = true;
          return {};
        });

      modelDetails.exportModel();

      // Make sure the nock server had the time to reply
      window.setTimeout(function() {
        try {
          assert(correctReply === true, "Nock server did not reach reply");
          done();
        } catch (e) {
          done(e);
        }
      }, 100);
    });

    it("Should be possible to publish a model private", function(done) {
      var correctReply = false;

      modelDetails.$parent = {};
      modelDetails.$parent.$broadcast = function() {
      };

      modelDetails.model.id = 4;

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .post("/api/v1/scenes/4/publish_private/")
        .reply(200, function() {
          correctReply = true;
          return {};
        });

      modelDetails.publishModel("private");

      // Make sure the nock server had the time to reply
      window.setTimeout(function() {
        try {
          assert(correctReply === true, "Nock server did not reach reply");
          done();
        } catch (e) {
          done(e);
        }
      }, 100);
    });

    it("Should be possible to publish a model company", function(done) {
      var correctReply = false;

      modelDetails.$parent = {};
      modelDetails.$parent.$broadcast = function() {
      };

      modelDetails.model.id = 4;

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .post("/api/v1/scenes/4/publish_company/")
        .reply(200, function() {
          correctReply = true;
          return {};
        });

      modelDetails.publishModel("company");

      // Make sure the nock server had the time to reply
      window.setTimeout(function() {
        try {
          assert(correctReply === true, "Nock server did not reach reply");
          done();
        } catch (e) {
          done(e);
        }
      }, 100);
    });

    it("Should be possible to publish a model world", function(done) {
      var correctReply = false;

      modelDetails.$parent = {};
      modelDetails.$parent.$broadcast = function() {
      };

      modelDetails.model.id = 4;

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .post("/api/v1/scenes/4/publish_world/")
        .reply(200, function() {
          correctReply = true;
          return {};
        });

      modelDetails.publishModel("world");

      // Make sure the nock server had the time to reply
      window.setTimeout(function() {
        try {
          assert(correctReply === true, "Nock server did not reach reply");
          done();
        } catch (e) {
          done(e);
        }
      }, 100);
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
    var app = new Vue({
      el: "#app"
    });
    // TODO: this element is not found
    var imageAnimation = new ImageAnimation({
      el: "#image-animation"
    });

    assert.isOk(app, "app");
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





})();
