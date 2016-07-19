/* global   */
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

  global.document = jsdom('<!doctype html><html><body><div id="app"><div id="model-create"></div><div id="model-details"></div></div><div id="template-container"></div><div id="dialog-container"></div></body></html>', {});

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
  var ConfirmDialog = require("../../app/scripts/components/confirmdialog.js").ConfirmDialog;

  global.ConfirmDialog = ConfirmDialog;
  var getDialog = require("../../app/scripts/components/confirmdialog.js").getDialog;

  global.getDialog = getDialog;

  var ModelDetails = require("../../app/scripts/components/modeldetails.js").ModelDetails;

  // used by other component
  global.ModelDetails = ModelDetails;

  var ModelCreate = require("../../app/scripts/components/modelcreate.js").ModelCreate;

  // used by other component
  var ScenarioCreate = require("../../app/scripts/components/scenariobuilder.js").ScenarioCreate;
  var SearchDetails = require("../../app/scripts/components/searchdetails.js").SearchDetails;
  var UserDetails = require("../../app/scripts/components/userdetails.js").UserDetails;

  // used by other component
  global.UserDetails = UserDetails;
  global.SearchDetails = SearchDetails;


  var SearchList = require("../../app/scripts/components/searchlist.js").SearchList;

  global.SearchList = SearchList;

  var SearchColumns = require("../../app/scripts/components/searchcolumns.js").SearchColumns;

  // why is this necessary....
  var factorToArray = require("../../app/scripts/components/scenariobuilder.js").factorToArray;

  _.assign(global, require("../../app/scripts/models.js"));
  _.assign(global, require("../../app/scripts/templates.js"));
  _.assign(global, require("../../app/scripts/scenarios.js"));



  // In testing we override the URL domain name. Otherwise nock cannot work. Nock does NOT support relative paths.
  // Using this, we can use http://0.0.0.0 in the nock.
  global.$.ajaxPrefilter(function(options) {
    //console.log(options);
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
          .filteringPath(function() {
            return "/api/v1/scenarios/";
          })
          .get("/api/v1/scenarios/")
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
          .get("/api/v1/scenes/")
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
            return "/api/v1/scenes/";
          })
          .get("/api/v1/scenes/")
          .reply(200, [
            {
              id: 405,
              name: "Run 1"
            }
          ]);

        global.fetchModel(405)
          .then(function(data) {
            assert.isOk(data, "we have some data");
            done();
          })
          .catch(function(e) {
            console.log("no data returned", e);
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

    it("Is possible to create a search columns", function(done) {
      var searchColumns = new SearchColumns();

      assert.isOk(searchColumns);
      done();
    });

    it("Is possible to create a search list", function(done) {
      var aSearchList = new SearchList();

      assert.isOk(aSearchList);
      done();
    });

  });




  describe("Search details", function() {

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
          parameter: [],
          shared: [],
          template: [],
          search: ""
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
    it("Should be possible to update with query parameters", function(done) {
      var scenarioCreate = new ScenarioCreate({
      });


      // fake the router
      scenarioCreate.$route = {};
      console.log("route", scenarioCreate.$route);
      scenarioCreate.$route.query = {
        name: "test"
      };

      // encoded in url

      /* eslint-disable quotes */
      scenarioCreate.$route.query.parameters = '{"engine":{"values":["Delft3D Curvilinear"],"name":"Model Engine"},"simstoptime":{"units":"days","values":[5],"name":"Stop time"},"clayvolcomposition":{"units":"%","values":[50],"name":"Clay volumetric composition"},"riverdischarge":{"units":"m³/s","values":[1000,1200,1400],"name":"River discharge"}}';
      /* eslint-enable quotes */

      // {
      //   "engine": {
      //     "values": ["Delft3D Curvilinear"],
      //     "name": "Model Engine"
      //   },
      //   "simstoptime": {
      //     "units": "days",
      //     "values": [5],
      //     "name": "Stop time"
      //   },
      //   "clayvolcomposition": {
      //     "units": "%",
      //     "values": [50],
      //     "name": "Clay volumetric composition"
      //   },
      //   "riverdischarge": {
      //     "units": "m³/s",
      //     "values": [1000, 1200, 1400],
      //     "name": "River discharge"
      //   }
      // }

      // check if we get an invalid error if we pass 0
      scenarioCreate.updateWithQueryParameters();
      assert.isOk(scenarioCreate);
      done();
    });
  });


  describe("ModelDetails", function() {
    var modelDetails = new ModelDetails();





    xit("Should be possible to fetchLog", function(done) {
      var correctReply = false;



      // Test fetch log, result comes from itemsCache
      var itemsCache = {};

      itemsCache = { "4": {
        fileurl: "fileurl/",
        info: {
          logfile: {
            location: "location/",
            file: "file"
          }
        }
      }};

      //modelDetails.itemsCache = itemsCache;
      modelDetails.model.id = 4;



      // We refer to this item:
      var model = itemsCache["4"];

      // Working dir is at: modeldata.fileurl + delf3d + delft3d.log
      var url = model.fileurl + model.info.logfile.location + model.info.logfile.file;

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .get(url)
        .reply(200, function() {
          correctReply = true;
          return {};
        });

      console.log("x");

      global.itemsCache = itemsCache;
      //global.models.itemsCache = itemsCache;
      modelDetails.fetchLog();

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


    xit("Should be possible to delete a model", function(done) {

      // Todo... this is an important one, hence this placeholder.
      done();
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

    it("Should be possible to start a model", function(done) {
      var correctReply = true;

      modelDetails.$parent = {};
      modelDetails.$parent.$broadcast = function() {
      };

      modelDetails.model.id = 4;

      nock("http://0.0.0.0")
        // jquery calls OPTIONS first
        .intercept("/api/v1/scenes/4/start/", "OPTIONS")
        .reply(200, function() {
          return "content";
        })
        // Browsers (and jquery) expect the Access-Control-Allow-Origin header
        .defaultReplyHeaders({"Access-Control-Allow-Origin": "*"})
        .put("/api/v1/scenes/4/start/")
        .reply(200, function() {
          return "{\"a\":4}";
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
      }, 150);
    });


    // Cannot get confirm to work..
    xit("Should be possible to stop a model", function(done) {
      var correctReply = true;

      modelDetails.$parent = {};
      modelDetails.$parent.$broadcast = function() {
      };

      modelDetails.model.id = 4;

      nock("http://0.0.0.0")
        .log(console.log)
        // jquery calls OPTIONS first
        .intercept("/api/v1/scenes/4/stop/", "OPTIONS")
        .reply(200, function() {
          console.log("intercept");
          return "content";
        })
        // Browsers (and jquery) expect the Access-Control-Allow-Origin header
        .defaultReplyHeaders({"Access-Control-Allow-Origin": "*"})
        .put("/api/v1/scenes/4/stop/", {id: modelDetails.model.id})
        .reply(200, function() {
          return "{\"a\":4}";
        });

      $("#dialog-container").load("/templates/confirm-dialog.html", function() {

        console.log("dialog template loaded");
        var stopDialog = modelDetails.stopModel();

        console.log(stopDialog);

        // confirm the dialog:
        stopDialog.onConfirm();

        // Make sure the nock server had the time to reply
        window.setTimeout(function() {
          try {
            assert(correctReply === true, "Nock server did not reach reply");
            done();
          } catch (e) {
            done(e);
          }
        }, 150);
      });
    });


    it("Should be possible to change download options", function(done) {

      // For now test if the function exists.
      modelDetails.downloadOptionsChange();
      done();
    });

    it("Should be possible to check level enabled", function(done) {

      // For now test if the function exists.
      modelDetails.isLevelEnabled(1);
      done();
    });


    it("Should be possible to check if read only", function(done) {

      // For now test if the function exists.
      modelDetails.isReadOnly();
      done();
    });


    it("Should be possible to check publish level", function(done) {

      // For now test if the function exists.
      modelDetails.indexOfPublishLevel();
      done();
    });

    it("Should be possible to hilight publish level", function(done) {

      // For now test if the function exists.
      modelDetails.highlightPublishLevel();
      done();
    });


    it("Should be possible to get isModelRunning property", function(done) {

      // Make sure the function returns true:
      var aModelDetails = new ModelDetails();

      // Some state for a fake model.
      aModelDetails.model = { state: "PROCESSING" };


      assert.isTrue(aModelDetails.isModelRunning);

      done();
    });

    it("Should be possible to get logoutput property", function(done) {

      // Make sure the function returns true:
      var aModelDetails = new ModelDetails();
      var logtext = "logtext";

      // Set some logoutput for a fake model.
      aModelDetails.model = { logoutput: logtext };


      assert.isTrue(aModelDetails.logoutput === logtext);

      done();
    });


    it("Should be possible to get scenario property", function(done) {

      var aModelDetails = new ModelDetails();


      // Should give -1 as default.
      assert.isTrue(aModelDetails.scenario === -1);

      done();
    });






    xit("Should be possible to publish a model private", function(done) {
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

      modelDetails.publishModel(0);

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

    xit("Should be possible to publish a model company", function(done) {
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

      modelDetails.publishModel(1);

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

    xit("Should be possible to publish a model world", function(done) {
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

      modelDetails.publishModel(2);

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


    it("Should be possible to check isanimating property", function(done) {

      imageAnimation.stopImageFrame();
      var isAnimating = imageAnimation.isAnimating;

      assert.isFalse(isAnimating, "Animation is indeed not playing");
      done();
    });

    it("Should be possible to check hasFrames property", function(done) {

      // We should not have any frames in this animation object, but maybe make sure later on?
      imageAnimation.model.info = { delta_fringe_images: { images: ["firstframe.jpg", "lastframe.jpg"] } };
      assert.isTrue(imageAnimation.hasFrames === true, "Animation does not have frames");
      done();
    });

    it("Should be possible to check animationIndex property", function(done) {

      // We should not have any frames in this animation object, but maybe make sure later on?
      imageAnimation.currentAnimationIndex = 0;
      assert.isTrue(imageAnimation.animationIndex === 0, "Animation frame at 0");
      done();
    });

    it("Should be possible to check animationFrame property", function(done) {

      // Todo.
      imageAnimation.model.info = { delta_fringe_images: { location: "location/", images: ["firstframe.jpg", "lastframe.jpg"] } };
      imageAnimation.model.fileurl = "fileurl/";

      var imgurl = imageAnimation.animationFrame;

      assert.isTrue(imgurl === "fileurl/location/firstframe.jpg", "Animation frame file matches expectation");

      done();
    });

    it("Should be possible to check frameCount property", function(done) {

      // We should not have any frames in this animation object, but maybe make sure later on?
      imageAnimation.model.info = { delta_fringe_images: { images: ["firstframe.jpg", "lastframe.jpg"] } };
      assert.isTrue(imageAnimation.frameCount === imageAnimation.model.info.delta_fringe_images.images.length, "Animation framecount should be 0");
      done();
    });


    it("Should be possible to switchAnimation", function(done) {

      // We should not have any frames in this animation object, but maybe make sure later on?
      imageAnimation.switchAnimation("delta_fringe_images");

      done();
    });

    it("Should be possible to gotoFirstFrame", function(done) {

      // index should become 0
      imageAnimation.model.info = { delta_fringe_images: { images: ["firstframe.jpg", "lastframe.jpg"] } };
      imageAnimation.gotoFirstFrame();

      assert.isTrue(imageAnimation.animationIndex === 0, "Animation frame at 0");
      done();
    });

    it("Should be possible to gotoLastFrame", function(done) {

      // index should become 0.. we do not have any images. Maybe test later using an fake array.
      imageAnimation.model.info = { delta_fringe_images: { images: ["firstframe.jpg", "lastframe.jpg"] } };
      imageAnimation.gotoLastFrame();

      assert.isTrue(imageAnimation.animationIndex === imageAnimation.model.info.delta_fringe_images.images.length - 1, "Animation frame at 0");
      done();
    });




  });


  describe("SearchList class", function() {


    it("Should be possible get selected scenarios", function(done) {

      // Add an artificial sene with a model in scene_set with id 1.
      var aSearchList = new SearchList();

      aSearchList.models = [];

       /*eslint-disable camelcase*/
      aSearchList.models.push({id: 123, scene_set: [{ id: 1}]});
       /*eslint-enable camelcase*/

      aSearchList.selectedRuns = [1]; // Assume we test #1

      var models = aSearchList.selectedModels;

      assert.isTrue((models.length === 1 && models[0] === 1), "selectedRun is correct.");
      done();
    });


    it("Should be possible get selectedModelid", function(done) {

      var aSearchList = new SearchList();

      // Add an artificial sene with a model in scene_set with id 1.
      aSearchList.selectedResultId = 1;

      assert.isTrue((aSearchList.selectedResultId === aSearchList.selectedModelId), "selectedResultId matches selectedModelid");
      done();
    });

    it("Should be possible call directSelect", function(done) {

      var aSearchList = new SearchList();
      var selectedId = 123;

      // select item
      aSearchList.directSelect(selectedId);

      assert.isTrue(aSearchList.selectedResultId === selectedId, "selectedResultId matches expected value");
      done();
    });


    it("Should be possible select an item without control key pressed ", function(done) {

      var aSearchList = new SearchList();
      var selectedId = 123;
      var fakeEvent = {};

      aSearchList.keyControlPressed = false;

      fakeEvent.target = "somediv"; // We cannot match html yet?

      // Start a run with the selected id.
      aSearchList.runSelected(selectedId, fakeEvent);

      // Start another run with the selected id +1;
      selectedId++;
      aSearchList.runSelected(selectedId, fakeEvent);

      // Without control key we expect only the last item selected.
      assert.isTrue(aSearchList.selectedRuns[0] === selectedId, "selectedResultId matches expected value");

      done();
    });


    // Todo, but required DOM.
    xit("Should be possible select an item WITH control key pressed ", function(done) {

      var aSearchList = new SearchList();
      var selectedId = 123;
      var fakeEvent = {};

      aSearchList.keyControlPressed = true;

      fakeEvent.target = "somediv"; // We cannot match html yet?

      // Start a run with the selected id.
      aSearchList.runSelected(selectedId, fakeEvent);

      // Start another run with the selected id +1;
      selectedId++;
      aSearchList.runSelected(selectedId, fakeEvent);

      console.log(aSearchList.selectedRuns);

      // Without control key we expect only the last item selected.
      assert.isTrue(aSearchList.selectedRuns[0] === (selectedId - 1) && aSearchList.selectedRuns[1] === (selectedId) && aSearchList.selectedRuns.length === 2, "selectedResultId matches expected value (two items with correct id's)");

      done();
    });


  });






  describe("SearchColumns class", function() {


    it("Should be possible to init SearchColumns", function(done) {

      var aSearchColumns = new SearchColumns();

      // Check default values:
      assert.isTrue(aSearchColumns.numScenarios === 0, "numScenarios matches");
      assert.isTrue(aSearchColumns.numRuns === 0, "numRuns matches");
      assert.isTrue(aSearchColumns.openedScenarios.length === 0, "openedScenarios matches");
      assert.isTrue(aSearchColumns.selectedRuns.length === 0, "selectedRuns matches");
      assert.isTrue(aSearchColumns.selectedScenarios.length === 0, "selectedScenarios matches");
      assert.isTrue(aSearchColumns.models.length === 0, "models matches");


      done();
    });

    it("Should be possible to reset the form fields", function(done) {

      var aSearchColumns = new SearchColumns();

      // Create fake input type with search-details class.
      global.$("body").append("<div class='search-details'><input type='text' name='test' id='test'/></div>");

      // Set some values in our DOM...
      $(".search-details input[type='text']").val("test");

      var val = $(".search-details input[type='text']").val();

      assert.isTrue(val === "test", "variable is correct.");

      aSearchColumns.resetFields();

      val = $(".search-details input[type='text']").val();

      assert.isTrue(val.length === 0, "textfield has been reset");

      done();
    });

    it("Should be possible to call modelsFound", function(done) {

      var aSearchColumns = new SearchColumns();

      // A fake model array..
      var models = [ { id: 123} ];
      var numScenarios = 1;
      var numRuns = 2;

      aSearchColumns.$dispatch("modelsFound", models, numScenarios, numRuns);

      assert.isTrue(aSearchColumns.numScenarios === numScenarios, "numScenarios matches");
      assert.isTrue(aSearchColumns.numRuns === numRuns, "numRuns matches");
      assert.deepEqual(aSearchColumns.models, models, "models matches");


      done();
    });


    it("Should be possible to call event modelsSelected", function(done) {

      var aSearchColumns = new SearchColumns();

      // A fake model array..
      var selected = 1;

      aSearchColumns.$dispatch("modelsSelected", selected);

      // How to test components?
      //var details = aSearchColumns.getChildByName("model-details");

      done();
    });

  });



  describe("UserDetails", function() {


    it("Should be possible to fetch my info", function(done) {
      var correctReply = false;

      nock("http://0.0.0.0")
        //.log(console.log)
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .get("/api/v1/users/me/")
        .reply(200, function() {
          correctReply = true;
          return {};
        });

      var userDetails = new UserDetails();

      assert.isOk(userDetails, "UserDetails created");

      // Make sure the nock server had the time to reply
      window.setTimeout(function() {
        try {
          assert(correctReply === true, "Nock server did not reach reply");
          done();
        } catch (e) {
          done(e);
        }
      }, 100);

      userDetails.fetchUserInfo();

    });

    it("Should be possible to receive my first and lastname", function(done) {
      var correctReply = false;

      // The fake reply we will return.
      var reply = [{
        "id": 500,
        "username": "foo",
        "first_name": "Foo",
        "last_name": "User",
        "email": "foo@bar.com",
        "groups": [
            42,
            500
        ]
      }];

      nock("http://0.0.0.0")
        //.log(console.log)
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .get("/api/v1/users/me/")
        .reply(200, function() {
          correctReply = true;
          return reply;
        });

      var userDetails = new UserDetails();

      assert.isOk(userDetails, "UserDetails created");

      // Make sure the nock server had the time to reply
      window.setTimeout(function() {
        try {
          assert(correctReply === true, "Nock server did not reach reply");

          // Check if the user info is set correctly.
          assert.isTrue((userDetails.user.first_name === reply[0].first_name && userDetails.user.last_name === reply[0].last_name), "First and lastname match");

          done();
        } catch (e) {
          done(e);
        }
      }, 100);

      userDetails.fetchUserInfo();

    });


    it("Should be possible to call the details computed property", function(done) {
      var correctReply = false;

      // The fake reply we will return.
      var reply = [{
        "id": 500,
        "username": "foo",
        "first_name": "Foo",
        "last_name": "User",
        "email": "foo@bar.com",
        "groups": [
            42,
            500
        ]
      }];

      nock("http://0.0.0.0")
        //.log(console.log)
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .get("/api/v1/users/me/")
        .reply(200, function() {
          correctReply = true;
          return reply;
        });

      var userDetails = new UserDetails();

      assert.isOk(userDetails, "UserDetails created");

      // Make sure the nock server had the time to reply
      window.setTimeout(function() {
        try {
          assert(correctReply === true, "Nock server did not reach reply");

          var details = userDetails.details;

          var match = "id: 500\nusername: foo\nfirst_name: Foo\nlast_name: User\nemail: foo@bar.com\ngroups: 42,500";

          // Check if the user info is set correctly.
          assert.isTrue(details === match, "details match");

          done();
        } catch (e) {
          done(e);
        }
      }, 100);

      userDetails.fetchUserInfo();

    });
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





})();
