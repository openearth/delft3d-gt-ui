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

  global.document = jsdom('<!doctype html><html><body><div id="app"><div id="model-create"></div><div id="model-details"></div></div><div id="template-container"></div><div id="dialog-container"></div><div id="scenario-container"></div> <div id="confirm-dialog-test-holder">topbar</div>  <div id="template-user-details"></div> <div id="top-bar">topbar</div> <div id="tool-bar">tool-bar</div> <div id="below-tool-bar">below-tool-bar</div> <div id="to_make_a_vscrollbar" style="height: 5000px;">text</div> </body></html>', {});

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


  // This is all needed to make the select picker object work (in searchdetails)
  // Will try to get this working later.
  // function test() {


  //   _.assign(global.jQuery, require("../../bower_components/jquery/dist/jquery.js"));
  //   jQuery = global.jQuery;
  //   console.log(jQuery);
  //   _.assign(global, require("../../bower_components/bootstrap-sass/assets/javascripts/bootstrap.min.js"));
  //   _.assign(global, require("../../bower_components/bootstrap-select/dist/js/bootstrap-select.min.js"));
  // }
  // test();

  // AS the above does not work, we create some fake jQuery wrappers to mock some of our function calls (sliders, modal, etc) we do this on the spot at some tests.


  $.fn.selectpicker = function(options) {
    console.log("SelectPicker mock: " + options);
  };

  $.fn.ionRangeSlider = function(options) {
    console.log("ionRangeSlider mock: " + options);
  };


  // In testing we override the URL domain name. Otherwise nock cannot work. Nock does NOT support relative paths.
  // Using this, we can use http://0.0.0.0 in the nock.
  global.$.ajaxPrefilter(function(options) {
   // console.log(options);
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
      it("Should be possible to LIST scenarios", function(done) {
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


      it("Should be possible to LIST scenarios - FAILURE test", function(done) {
        nock("http://0.0.0.0")
          .defaultReplyHeaders({
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          })
          .filteringPath(function() {
            return "/api/v1/scenarios/";
          })
          .get("/api/v1/scenarios/")
          .reply(400, {
          });

        // We expect an error, so we call done if this happens.
        global.fetchScenarios().catch(function() {
          // We expected an error.
          done();
        });

      });



    // Can we remove scenarios?
      it("Should be possible to DELETE scenarios", function(done) {

        var deleteid = 4;
        var correctReply = false;

        nock("http://0.0.0.0")
          //.log(console.log)
          .defaultReplyHeaders({
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          })
          .intercept("/api/v1/scenarios/" + deleteid + "/", "OPTIONS") // We get an "OPTIONS" first.
          .reply(200, function() {
            return "";
          })
          .delete("/api/v1/scenarios/" + deleteid + "/")
          .reply(200, function() {
            correctReply = true;
            return {"result": "ok"};
          });

        global.deleteScenario(deleteid);

        window.setTimeout(function() {
          try {
            assert(correctReply === true, "Nock server did not reach reply");
            done();
          } catch (e) {
            done(e);
          }
        }, 100);
      });


      it("Should be possible to DELETE scenarios - FAILURE test", function(done) {

        var deleteid = 4;

        nock("http://0.0.0.0")
          //.log(console.log)
          .defaultReplyHeaders({
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          })
          .intercept("/api/v1/scenarios/" + deleteid + "/", "OPTIONS") // We get an "OPTIONS" first.
          .reply(400, function() {
            return "";
          })
          .delete("/api/v1/scenarios/" + deleteid + "/")
          .reply(200, function() {
            return "";
          });

        // An error is expected, so we use done() when it happens.
        global.deleteScenario(deleteid).catch(function() {
          // We expected an error.
          done();
        });

      });


      // Test deletescenario when we do not specify any id
      it("Should be possible to DELETE scenarios - no id specified", function(done) {

        // We expect that an error message appears from this call without id
        global.deleteScenario().catch(function(e) {
          assert.equal(e, "No scenario id to delete");

          done();
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




      // This test is now working using the filteringPath option.
      // When testing get request, this seems to be the solution.
      it("If we can query the model list - FAILURE test", function(done) {
        nock("http://0.0.0.0")
          .defaultReplyHeaders({
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          })
          .get("/api/v1/scenes/")
          .reply(400, [
            {
              id: 1,
              name: "Run 1"
            }
          ]);


        global.fetchModels().catch(function() {
          // We expected an error.
          done();
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

      it("Should get an error when requesting model WITHOUT an id", function(done) {

        global.fetchModel()
          .catch(function(e) {
            assert.equal(e.message, "Model not found, even after updating");

            done();
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



  describe("ConfirmDialog", function() {

    it("Does confirmdialog have right 'props'", function(done) {

      var defaultProps = {
        "dialogId": {
          type: String,
          required: true
        },
        "confirmButtonTitle": {
          type: String,
          required: true
        }
      };

      assert.deepEqual(ConfirmDialog.options.props, defaultProps, "Match default properties");

      done();
    });

    it("Is possible to make a confirmdialog", function(done) {
      var confirmDialog = new ConfirmDialog();


      // Simple test, see if object exists
      assert.isOk(confirmDialog);
      done();
    });


    it("Is possible to confirm", function(done) {
      var confirmDialog = new ConfirmDialog();

      confirmDialog.dialogId = "test";


      // Call confirm,
      confirmDialog.onConfirm = function() {
        done();
      };

      confirmDialog.confirm();

    });

    it("Is possible to cancel", function(done) {
      var confirmDialog = new ConfirmDialog();

      confirmDialog.dialogId = "test";

      // Simple test, see if object exists
      confirmDialog.onCancel = function() {
        done();
      };

      confirmDialog.cancel();
    });

    it("Is possible to show", function(done) {
      var confirmDialog = new ConfirmDialog();

      confirmDialog.dialogId = "test";

      // Simple test, see if object exists

      $("#confirm-dialog-test-holder").html("<div id='test-dialog'>dialog</div>");
      $.fn.modal = undefined;

      confirmDialog.show();
      done();
    });

    it("Is possible to show - with modal", function(done) {
      var confirmDialog = new ConfirmDialog();

      confirmDialog.dialogId = "test";

      // Simple test, see if object exists

      $("#confirm-dialog-test-holder").html("<div id='test-dialog'>dialog</div>");


      // Normally this is applied directly to an element, with a jquery reference, but we cannot do that using tests?
      $.fn.modal = function() {
        done();
        $.fn.modal = undefined; // Unset for later calls.
      };

      confirmDialog.show();
    });


    it("Is possible to hide", function(done) {
      var confirmDialog = new ConfirmDialog();

      confirmDialog.dialogId = "test";


      $("#confirm-dialog-test-holder").html("<div id='test-dialog'>dialog</div>");


      confirmDialog.hide();

      done();
    });

    it("Is possible to hide - with modal", function(done) {
      var confirmDialog = new ConfirmDialog();

      confirmDialog.dialogId = "test";


      $("#confirm-dialog-test-holder").html("<div id='test-dialog'>dialog</div>");

      // Normally this is applied directly to an element, with a jquery reference, but we cannot do that using tests?
      $.fn.modal = function() {

        done();
        $.fn.modal = undefined; // Unset for later calls.
      };

      confirmDialog.hide();

    });


    it("Is possible to showAlert", function(done) {
      var confirmDialog = new ConfirmDialog();

      confirmDialog.dialogId = "test";

      // Simple test, see if object exists
      confirmDialog.showAlert();

      done();
    });

    it("Does getDialog exist", function(done) {

      // Simple test, see if object exists (we do not have al lthe dialog elements and components here ...)
      assert.isOk(getDialog);
      done();
    });

  });

  describe("Search details", function() {


    it("Does Searchdetails have the initial values", function(done) {

      var searchDetails = new SearchDetails();
      var defaultData = {
        selectedTemplates: [],

        // Fixed properties
        templates: [],
        shared: [],
        startDate: null,
        endDate: null,
        search: "",

        // This object will variables received from the templates.
        selectedParameters: { },

        // Template used for searching (probably always one)
        searchTemplates: []
      };

      /*eslint-disable no-underscore-dangle*/
      assert.deepEqual(searchDetails._data, defaultData, "Match default properties");
      /*eslint-enable no-underscore-dangle*/

      done();

    });

    it("Searchdetails - loadSearchTemplates", function(done) {

      var searchDetails = new SearchDetails();
      var expectedTemplates = 2; // Number of templates we expected to load.

      nock("http://0.0.0.0")
        .log(console.log)
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .get("/api/v1/searchforms/")
        .reply(200, function() {

          return "[{\"id\":1,\"name\":\"MAIN\",\"sections\":[{\"variables\":[{\"validators\":{},\"type\":\"text\",\"id\":\"name\",\"name\":\"Name\"},{\"disabled\":true,\"type\":\"text\",\"id\":\"engine\",\"name\":\"Model Engine\",\"validators\":{}},{\"disabled\":true,\"type\":\"semver\",\"id\":\"version\",\"name\":\"Version\",\"validators\":{}}],\"name\":\"Scenario\"},{\"variables\":[{\"units\":\"days\",\"type\":\"numeric\",\"id\":\"simstoptime\",\"name\":\"Stop time\",\"validators\":{\"max\":160,\"min\":0}},{\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\",\"validators\":{\"max\":2,\"min\":0.5},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"outputinterval\",\"name\":\"Output timestep\"}],\"name\":\"Parameters\"},{\"variables\":[{\"name\":\"Basin slope\",\"validators\":{\"max\":0.3,\"min\":0.01},\"factor\":true,\"units\":\"deg\",\"type\":\"numeric\",\"id\":\"basinslope\"},{\"name\":\"River width\",\"validators\":{\"max\":1000,\"min\":100},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"riverwidth\"}],\"name\":\"Geometry\"},{\"variables\":[{\"name\":\"River discharge\",\"validators\":{\"max\":2000,\"min\":0},\"factor\":true,\"units\":\"mÂ³/s\",\"type\":\"numeric\",\"id\":\"riverdischarge\"},{\"name\":\"Tidal amplitude\",\"validators\":{\"max\":3,\"min\":0},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"tidalamplitude\"}],\"name\":\"Forces\"},{\"variables\":[{\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\",\"id\":\"composition\",\"validators\":{},\"type\":\"select\",\"options\":[{\"text\":\"coarse-sand\",\"value\":\"coarse-sand\"},{\"text\":\"medium-sand\",\"value\":\"medium-sand\"},{\"text\":\"fine-sand\",\"value\":\"fine-sanday\"},{\"text\":\"coarse-silt\",\"value\":\"coarse-silt\"},{\"text\":\"medium-silt\",\"value\":\"medium-silt\"},{\"text\":\"fine-silt\",\"value\":\"fine-silt\"}],\"name\":\"Sediment classes\"}],\"name\":\"Sediment composition\",\"description\":\"Sediment can consist of a mixture of different classes. Read <a href='more'>more</a> about the sediment composition clasess.\"}],\"templates\":[{\"name\":\"Basin fill\",\"id\":3},{\"name\":\"Basin fill with marine reworking\",\"id\":4}]}]";
        });

      searchDetails.loadSearchTemplates();

      // we expect two replies.
      window.setTimeout(function() {
        try {
          assert.isTrue(searchDetails.templates.length === expectedTemplates, "Did not get expected templates");
          done();
        } catch (e) {
          done(e);
        }
      }, 100);



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


    it("Is possible to start a search", function(done) {
      var searchDetails = new SearchDetails();
      var replyCount = 0;

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .get("/api/v1/scenarios/")
        .query({"search": ""})
        .reply(200, function() {
          replyCount++;
          return "[{'id':357,'name':'New Delta Plain Scenario','owner_url':'http://localhost:9000/api/v1/users/500/','template':1,'parameters':{'engine':{'values':['Delft3D Curvilinear'],'name':'Model Engine'},'simstoptime':{'units':'days','values':[60],'name':'Stop time'},'clayvolcomposition':{'units':'%','values':[1],'name':'Clay volumetric composition'},'sandvolcomposition':{'units':'%','values':[1],'name':'Sand volumetric composition'},'version':{'values':['v0.1'],'name':'Version'},'riverdischarge':{'units':'m³/s','values':[1000],'name':'River discharge'},'riverwidth':{'units':'m','values':[555],'name':'River width'},'dt':{'units':'min','values':[1],'name':'Timestep'},'tidalamplitude':{'units':'m','values':[1],'name':'Tidal amplitude'},'outputinterval':{'units':'days','values':[1],'name':'Output timestep','description':'Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.'},'basinslope':{'units':'deg','values':[0.0143],'name':'Basin slope'}},'progress':0,'scene_set':[897]}]";
        });

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .get("/api/v1/scenes/")
        .query({"search": ""})
        .reply(200, function() {
          replyCount++;
          return "[{'id':897,'name':'New Delta Plain Scenario: Run 1','state':'INACTIVE','progress':0,'owner':{'id':500,'username':'foo','first_name':'Foo','last_name':'User','email':'foo@bar.com','groups':[42,500]},'shared':'p','suid':'cfa3b8a6-87b8-4f3a-b0f8-da7c6dc3468e','scenario':[357],'fileurl':'/files/cfa3b8a6-87b8-4f3a-b0f8-da7c6dc3468e/','info':{'channel_network_images':{'images':[],'location':'process/'},'logfile':{'location':'simulation/','file':''},'delta_fringe_images':{'images':[],'location':'process/'},'procruns':0,'sediment_fraction_images':{'images':[],'location':'process/'}},'parameters':{'engine':{'name':'Model Engine','value':'Delft3D Curvilinear'},'simstoptime':{'units':'days','name':'Stop time','value':60},'clayvolcomposition':{'units':'%','name':'Clay volumetric composition','value':1},'sandvolcomposition':{'units':'%','name':'Sand volumetric composition','value':1},'version':{'name':'Version','value':'v0.1'},'riverdischarge':{'units':'m³/s','name':'River discharge','value':1000},'riverwidth':{'units':'m','name':'River width','value':555},'dt':{'units':'min','name':'Timestep','value':1},'tidalamplitude':{'units':'m','name':'Tidal amplitude','value':1},'outputinterval':{'units':'days','name':'Output timestep','value':1,'description':'Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.'},'basinslope':{'units':'deg','name':'Basin slope','value':0.0143}},'task_id':'afbc3296-1679-450a-8c5e-5b6431c5cf20','workingdir':'/data/container/files/cfa3b8a6-87b8-4f3a-b0f8-da7c6dc3468e/'}]";
        });

      searchDetails.startSearch();

      // we expect two replies.
      window.setTimeout(function() {
        try {
          assert.isTrue(replyCount === 2, "Nock server did not reach replies");
          done();
        } catch (e) {
          done(e);
        }
      }, 100);

    });


    it("Is possible to process search", function(done) {
      var searchDetails = new SearchDetails();
      var replyCount = 0;

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .get("/api/v1/scenarios/")
        .query({"search": ""})
        .reply(200, function() {

          replyCount++;
          return JSON.parse("[{\"id\":379,\"name\":\"Shared with company\",\"owner_url\":\"http://localhost:9000/api/v1/users/500/?format=json\",\"template\":50,\"parameters\":{},\"progress\":0,\"scene_set\":[909]},{\"id\":380,\"name\":\"Shared with world\",\"owner_url\":\"http://localhost:9000/api/v1/users/500/?format=json\",\"template\":50,\"parameters\":{},\"progress\":0,\"scene_set\":[914]},{\"id\":381,\"name\":\"Basin Fill Scenario\",\"owner_url\":\"http://localhost:9000/api/v1/users/500/?format=json\",\"template\":50,\"parameters\":{\"engine\":{\"values\":[\"Delft3D Curvilinear\"],\"name\":\"Model Engine\"},\"simstoptime\":{\"units\":\"days\",\"values\":[60],\"name\":\"Stop time\"},\"tidalamplitude\":{\"units\":\"m\",\"values\":[1],\"name\":\"Tidal amplitude\"},\"version\":{\"values\":[\"v0.1\"],\"name\":\"Version\"},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"values\":[1000],\"name\":\"River discharge\"},\"template\":{\"values\":[\"Basin fill\"]},\"riverwidth\":{\"units\":\"m\",\"values\":[300],\"name\":\"River width\"},\"basinslope\":{\"units\":\"deg\",\"values\":[0.0143],\"name\":\"Basin slope\"},\"composition\":{\"values\":[\"medium-sand\"],\"name\":\"Sediment classes\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"outputinterval\":{\"units\":\"days\",\"values\":[1],\"name\":\"Output timestep\",\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"}},\"progress\":0,\"scene_set\":[909]},{\"id\":382,\"name\":\"Basin Fill Scenario\",\"owner_url\":\"http://localhost:9000/api/v1/users/500/?format=json\",\"template\":50,\"parameters\":{\"engine\":{\"values\":[\"Delft3D Curvilinear\"],\"name\":\"Model Engine\"},\"simstoptime\":{\"units\":\"days\",\"values\":[60],\"name\":\"Stop time\"},\"tidalamplitude\":{\"units\":\"m\",\"values\":[1],\"name\":\"Tidal amplitude\"},\"version\":{\"values\":[\"v0.1\"],\"name\":\"Version\"},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"values\":[1000],\"name\":\"River discharge\"},\"template\":{\"values\":[\"Basin fill\"]},\"riverwidth\":{\"units\":\"m\",\"values\":[300,400,500,600,700],\"name\":\"River width\"},\"basinslope\":{\"units\":\"deg\",\"values\":[0.0143],\"name\":\"Basin slope\"},\"composition\":{\"values\":[\"medium-sand\"],\"name\":\"Sediment classes\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"outputinterval\":{\"units\":\"days\",\"values\":[1],\"name\":\"Output timestep\",\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"}},\"progress\":0,\"scene_set\":[909,910,911,912,913]},{\"id\":383,\"name\":\"Basin Fill Scenario\",\"owner_url\":\"http://localhost:9000/api/v1/users/500/?format=json\",\"template\":50,\"parameters\":{\"engine\":{\"values\":[\"Delft3D Curvilinear\"],\"name\":\"Model Engine\"},\"simstoptime\":{\"units\":\"days\",\"values\":[60],\"name\":\"Stop time\"},\"tidalamplitude\":{\"units\":\"m\",\"values\":[1],\"name\":\"Tidal amplitude\"},\"version\":{\"values\":[\"v0.1\"],\"name\":\"Version\"},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"values\":[1000],\"name\":\"River discharge\"},\"template\":{\"values\":[\"Basin fill\"]},\"riverwidth\":{\"units\":\"m\",\"values\":[555],\"name\":\"River width\"},\"basinslope\":{\"units\":\"deg\",\"values\":[0.0143],\"name\":\"Basin slope\"},\"composition\":{\"values\":[\"medium-sand\"],\"name\":\"Sediment classes\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"outputinterval\":{\"units\":\"days\",\"values\":[1],\"name\":\"Output timestep\",\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"}},\"progress\":0,\"scene_set\":[914]},{\"id\":388,\"name\":\"Basin Fill Scenario\",\"owner_url\":\"http://localhost:9000/api/v1/users/500/?format=json\",\"template\":50,\"parameters\":{\"engine\":{\"values\":[\"Delft3D Curvilinear\"],\"name\":\"Model Engine\"},\"simstoptime\":{\"units\":\"days\",\"values\":[60],\"name\":\"Stop time\"},\"tidalamplitude\":{\"units\":\"m\",\"values\":[1],\"name\":\"Tidal amplitude\"},\"version\":{\"values\":[\"v0.1\"],\"name\":\"Version\"},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"values\":[1000],\"name\":\"River discharge\"},\"template\":{\"values\":[\"Basin fill\"]},\"riverwidth\":{\"units\":\"m\",\"values\":[300,500,600],\"name\":\"River width\"},\"basinslope\":{\"units\":\"deg\",\"values\":[0.0143],\"name\":\"Basin slope\"},\"composition\":{\"values\":[\"medium-sand\"],\"name\":\"Sediment classes\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"outputinterval\":{\"units\":\"days\",\"values\":[1],\"name\":\"Output timestep\",\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"}},\"progress\":0,\"scene_set\":[909,911,912]},{\"id\":389,\"name\":\"Test Basin Fill Scenario\",\"owner_url\":\"http://localhost:9000/api/v1/users/500/?format=json\",\"template\":52,\"parameters\":{\"simstoptime\":{\"units\":\"days\",\"values\":[60],\"name\":\"Stop time\"},\"composition\":{\"values\":[\"medium-sand\"],\"name\":\"Sediment classes\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"values\":[1000],\"name\":\"River discharge\"},\"template\":{\"values\":[\"Testing template\"]},\"riverwidth\":{\"units\":\"m\",\"values\":[300],\"name\":\"River width\"},\"dt\":{\"units\":\"min\",\"values\":[2],\"name\":\"Timestep\"},\"tidalamplitude\":{\"units\":\"m\",\"values\":[1],\"name\":\"Tidal amplitude\"},\"outputinterval\":{\"units\":\"days\",\"values\":[1],\"name\":\"Output timestep\",\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"},\"basinslope\":{\"units\":\"deg\",\"values\":[0.04],\"name\":\"Basin slope\"}},\"progress\":0,\"scene_set\":[915]}]");
        });

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .get("/api/v1/scenes/")
        .query({"search": ""})
        .reply(200, function() {

          replyCount++;
          return JSON.parse("[{\"id\":909,\"name\":\"Basin Fill Scenario: Run 1\",\"state\":\"ABORTED\",\"progress\":0,\"owner\":{\"id\":500,\"username\":\"foo\",\"first_name\":\"Foo\",\"last_name\":\"User\",\"email\":\"foo@bar.com\",\"groups\":[42,500]},\"shared\":\"c\",\"suid\":\"ca9a22df-05ef-4c50-9561-dc39c85bfc45\",\"scenario\":[381,382,379,384,386,388],\"fileurl\":\"/files/ca9a22df-05ef-4c50-9561-dc39c85bfc45/\",\"info\":{\"procruns\":1,\"simulation\":{\"info\":{\"model_id\":\"88a98ead-446c-450e-a16f-ce8a83e687ba\",\"task\":\"simulation\",\"log\":[{\"progressprev\":\"0.00\",\"level\":\"INFO\",\"progresshigh\":\"0.00\",\"levelhigh\":\"INFO\",\"messages\":[\"  Time to finish  1d 14h,    0.1% completed, time steps left  86307\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86306\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86305\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86303\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86302\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":\"0.00\",\"message\":\"  Time to finish  1d 14h,    0.1% completed, time steps left  86302\",\"latesterror\":\"\"},{\"progressprev\":0,\"level\":\"INFO\",\"progresshigh\":0,\"levelhigh\":\"INFO\",\"messages\":[\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":0,\"message\":\"INFO:__main__:use container directory structure\",\"latesterror\":\"\"}],\"procruns\":1,\"container_id\":{\"processing\":\"568d2d326706a0070ee8b25daeca4b3d09aee79bd542110d0dbff09d0d4e5c07\",\"simulation\":\"acfa7f1045ed3e3aa387d7b01728e6628cde096c925cca46d95c3d32596a635e\"},\"output\":\"\"},\"state\":\"PROCESSING\"},\"delta_fringe_images\":{\"images\":[],\"location\":\"process/\"},\"preprocess\":{\"info\":{\"model_id\":\"eb230e8e-9278-4029-a54e-a8699c5e5bb1\",\"task\":\"preprocess\",\"log\":{\"progressprev\":0,\"level\":\"INFO\",\"progresshigh\":0,\"levelhigh\":\"INFO\",\"messages\":[\"\",\"A    svn/template/testing_template/coarse-silt.mdf\",\"INFO:__main__:Finish preprocessing: 100% done\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":0,\"message\":\"INFO:__main__:Finish preprocessing: 100% done\",\"latesterror\":\"\"},\"container_id\":\"30e60fa70e72db201a1ba979baaa670a84430c5fb6081434f9a9f99fce1ddc20\",\"output\":\"\"},\"state\":\"SUCCESS\"},\"channel_network_images\":{\"images\":[],\"location\":\"process/\"},\"logfile\":{\"location\":\"simulation/\",\"file\":\"delft3d.log\"},\"sediment_fraction_images\":{\"images\":[],\"location\":\"process/\"}},\"parameters\":{\"engine\":{\"name\":\"Model Engine\",\"value\":\"Delft3D Curvilinear\"},\"simstoptime\":{\"units\":\"days\",\"name\":\"Stop time\",\"value\":60},\"tidalamplitude\":{\"units\":\"m\",\"name\":\"Tidal amplitude\",\"value\":1},\"version\":{\"name\":\"Version\",\"value\":\"v0.1\"},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"name\":\"River discharge\",\"value\":1000},\"template\":{\"value\":\"Basin fill\"},\"riverwidth\":{\"units\":\"m\",\"name\":\"River width\",\"value\":300},\"basinslope\":{\"units\":\"deg\",\"name\":\"Basin slope\",\"value\":0.0143},\"composition\":{\"name\":\"Sediment classes\",\"value\":\"medium-sand\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"outputinterval\":{\"units\":\"days\",\"name\":\"Output timestep\",\"value\":1,\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"}},\"task_id\":\"\",\"workingdir\":\"/data/container/files/ca9a22df-05ef-4c50-9561-dc39c85bfc45/\"},{\"id\":909,\"name\":\"Basin Fill Scenario: Run 1\",\"state\":\"ABORTED\",\"progress\":0,\"owner\":{\"id\":500,\"username\":\"foo\",\"first_name\":\"Foo\",\"last_name\":\"User\",\"email\":\"foo@bar.com\",\"groups\":[42,500]},\"shared\":\"c\",\"suid\":\"ca9a22df-05ef-4c50-9561-dc39c85bfc45\",\"scenario\":[381,382,379,384,386,388],\"fileurl\":\"/files/ca9a22df-05ef-4c50-9561-dc39c85bfc45/\",\"info\":{\"procruns\":1,\"simulation\":{\"info\":{\"model_id\":\"88a98ead-446c-450e-a16f-ce8a83e687ba\",\"task\":\"simulation\",\"log\":[{\"progressprev\":\"0.00\",\"level\":\"INFO\",\"progresshigh\":\"0.00\",\"levelhigh\":\"INFO\",\"messages\":[\"  Time to finish  1d 14h,    0.1% completed, time steps left  86307\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86306\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86305\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86303\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86302\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":\"0.00\",\"message\":\"  Time to finish  1d 14h,    0.1% completed, time steps left  86302\",\"latesterror\":\"\"},{\"progressprev\":0,\"level\":\"INFO\",\"progresshigh\":0,\"levelhigh\":\"INFO\",\"messages\":[\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":0,\"message\":\"INFO:__main__:use container directory structure\",\"latesterror\":\"\"}],\"procruns\":1,\"container_id\":{\"processing\":\"568d2d326706a0070ee8b25daeca4b3d09aee79bd542110d0dbff09d0d4e5c07\",\"simulation\":\"acfa7f1045ed3e3aa387d7b01728e6628cde096c925cca46d95c3d32596a635e\"},\"output\":\"\"},\"state\":\"PROCESSING\"},\"delta_fringe_images\":{\"images\":[],\"location\":\"process/\"},\"preprocess\":{\"info\":{\"model_id\":\"eb230e8e-9278-4029-a54e-a8699c5e5bb1\",\"task\":\"preprocess\",\"log\":{\"progressprev\":0,\"level\":\"INFO\",\"progresshigh\":0,\"levelhigh\":\"INFO\",\"messages\":[\"\",\"A    svn/template/testing_template/coarse-silt.mdf\",\"INFO:__main__:Finish preprocessing: 100% done\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":0,\"message\":\"INFO:__main__:Finish preprocessing: 100% done\",\"latesterror\":\"\"},\"container_id\":\"30e60fa70e72db201a1ba979baaa670a84430c5fb6081434f9a9f99fce1ddc20\",\"output\":\"\"},\"state\":\"SUCCESS\"},\"channel_network_images\":{\"images\":[],\"location\":\"process/\"},\"logfile\":{\"location\":\"simulation/\",\"file\":\"delft3d.log\"},\"sediment_fraction_images\":{\"images\":[],\"location\":\"process/\"}},\"parameters\":{\"engine\":{\"name\":\"Model Engine\",\"value\":\"Delft3D Curvilinear\"},\"simstoptime\":{\"units\":\"days\",\"name\":\"Stop time\",\"value\":60},\"tidalamplitude\":{\"units\":\"m\",\"name\":\"Tidal amplitude\",\"value\":1},\"version\":{\"name\":\"Version\",\"value\":\"v0.1\"},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"name\":\"River discharge\",\"value\":1000},\"template\":{\"value\":\"Basin fill\"},\"riverwidth\":{\"units\":\"m\",\"name\":\"River width\",\"value\":300},\"basinslope\":{\"units\":\"deg\",\"name\":\"Basin slope\",\"value\":0.0143},\"composition\":{\"name\":\"Sediment classes\",\"value\":\"medium-sand\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"outputinterval\":{\"units\":\"days\",\"name\":\"Output timestep\",\"value\":1,\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"}},\"task_id\":\"\",\"workingdir\":\"/data/container/files/ca9a22df-05ef-4c50-9561-dc39c85bfc45/\"},{\"id\":909,\"name\":\"Basin Fill Scenario: Run 1\",\"state\":\"ABORTED\",\"progress\":0,\"owner\":{\"id\":500,\"username\":\"foo\",\"first_name\":\"Foo\",\"last_name\":\"User\",\"email\":\"foo@bar.com\",\"groups\":[42,500]},\"shared\":\"c\",\"suid\":\"ca9a22df-05ef-4c50-9561-dc39c85bfc45\",\"scenario\":[381,382,379,384,386,388],\"fileurl\":\"/files/ca9a22df-05ef-4c50-9561-dc39c85bfc45/\",\"info\":{\"procruns\":1,\"simulation\":{\"info\":{\"model_id\":\"88a98ead-446c-450e-a16f-ce8a83e687ba\",\"task\":\"simulation\",\"log\":[{\"progressprev\":\"0.00\",\"level\":\"INFO\",\"progresshigh\":\"0.00\",\"levelhigh\":\"INFO\",\"messages\":[\"  Time to finish  1d 14h,    0.1% completed, time steps left  86307\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86306\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86305\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86303\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86302\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":\"0.00\",\"message\":\"  Time to finish  1d 14h,    0.1% completed, time steps left  86302\",\"latesterror\":\"\"},{\"progressprev\":0,\"level\":\"INFO\",\"progresshigh\":0,\"levelhigh\":\"INFO\",\"messages\":[\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":0,\"message\":\"INFO:__main__:use container directory structure\",\"latesterror\":\"\"}],\"procruns\":1,\"container_id\":{\"processing\":\"568d2d326706a0070ee8b25daeca4b3d09aee79bd542110d0dbff09d0d4e5c07\",\"simulation\":\"acfa7f1045ed3e3aa387d7b01728e6628cde096c925cca46d95c3d32596a635e\"},\"output\":\"\"},\"state\":\"PROCESSING\"},\"delta_fringe_images\":{\"images\":[],\"location\":\"process/\"},\"preprocess\":{\"info\":{\"model_id\":\"eb230e8e-9278-4029-a54e-a8699c5e5bb1\",\"task\":\"preprocess\",\"log\":{\"progressprev\":0,\"level\":\"INFO\",\"progresshigh\":0,\"levelhigh\":\"INFO\",\"messages\":[\"\",\"A    svn/template/testing_template/coarse-silt.mdf\",\"INFO:__main__:Finish preprocessing: 100% done\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":0,\"message\":\"INFO:__main__:Finish preprocessing: 100% done\",\"latesterror\":\"\"},\"container_id\":\"30e60fa70e72db201a1ba979baaa670a84430c5fb6081434f9a9f99fce1ddc20\",\"output\":\"\"},\"state\":\"SUCCESS\"},\"channel_network_images\":{\"images\":[],\"location\":\"process/\"},\"logfile\":{\"location\":\"simulation/\",\"file\":\"delft3d.log\"},\"sediment_fraction_images\":{\"images\":[],\"location\":\"process/\"}},\"parameters\":{\"engine\":{\"name\":\"Model Engine\",\"value\":\"Delft3D Curvilinear\"},\"simstoptime\":{\"units\":\"days\",\"name\":\"Stop time\",\"value\":60},\"tidalamplitude\":{\"units\":\"m\",\"name\":\"Tidal amplitude\",\"value\":1},\"version\":{\"name\":\"Version\",\"value\":\"v0.1\"},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"name\":\"River discharge\",\"value\":1000},\"template\":{\"value\":\"Basin fill\"},\"riverwidth\":{\"units\":\"m\",\"name\":\"River width\",\"value\":300},\"basinslope\":{\"units\":\"deg\",\"name\":\"Basin slope\",\"value\":0.0143},\"composition\":{\"name\":\"Sediment classes\",\"value\":\"medium-sand\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"outputinterval\":{\"units\":\"days\",\"name\":\"Output timestep\",\"value\":1,\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"}},\"task_id\":\"\",\"workingdir\":\"/data/container/files/ca9a22df-05ef-4c50-9561-dc39c85bfc45/\"},{\"id\":909,\"name\":\"Basin Fill Scenario: Run 1\",\"state\":\"ABORTED\",\"progress\":0,\"owner\":{\"id\":500,\"username\":\"foo\",\"first_name\":\"Foo\",\"last_name\":\"User\",\"email\":\"foo@bar.com\",\"groups\":[42,500]},\"shared\":\"c\",\"suid\":\"ca9a22df-05ef-4c50-9561-dc39c85bfc45\",\"scenario\":[381,382,379,384,386,388],\"fileurl\":\"/files/ca9a22df-05ef-4c50-9561-dc39c85bfc45/\",\"info\":{\"procruns\":1,\"simulation\":{\"info\":{\"model_id\":\"88a98ead-446c-450e-a16f-ce8a83e687ba\",\"task\":\"simulation\",\"log\":[{\"progressprev\":\"0.00\",\"level\":\"INFO\",\"progresshigh\":\"0.00\",\"levelhigh\":\"INFO\",\"messages\":[\"  Time to finish  1d 14h,    0.1% completed, time steps left  86307\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86306\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86305\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86303\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86302\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":\"0.00\",\"message\":\"  Time to finish  1d 14h,    0.1% completed, time steps left  86302\",\"latesterror\":\"\"},{\"progressprev\":0,\"level\":\"INFO\",\"progresshigh\":0,\"levelhigh\":\"INFO\",\"messages\":[\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":0,\"message\":\"INFO:__main__:use container directory structure\",\"latesterror\":\"\"}],\"procruns\":1,\"container_id\":{\"processing\":\"568d2d326706a0070ee8b25daeca4b3d09aee79bd542110d0dbff09d0d4e5c07\",\"simulation\":\"acfa7f1045ed3e3aa387d7b01728e6628cde096c925cca46d95c3d32596a635e\"},\"output\":\"\"},\"state\":\"PROCESSING\"},\"delta_fringe_images\":{\"images\":[],\"location\":\"process/\"},\"preprocess\":{\"info\":{\"model_id\":\"eb230e8e-9278-4029-a54e-a8699c5e5bb1\",\"task\":\"preprocess\",\"log\":{\"progressprev\":0,\"level\":\"INFO\",\"progresshigh\":0,\"levelhigh\":\"INFO\",\"messages\":[\"\",\"A    svn/template/testing_template/coarse-silt.mdf\",\"INFO:__main__:Finish preprocessing: 100% done\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":0,\"message\":\"INFO:__main__:Finish preprocessing: 100% done\",\"latesterror\":\"\"},\"container_id\":\"30e60fa70e72db201a1ba979baaa670a84430c5fb6081434f9a9f99fce1ddc20\",\"output\":\"\"},\"state\":\"SUCCESS\"},\"channel_network_images\":{\"images\":[],\"location\":\"process/\"},\"logfile\":{\"location\":\"simulation/\",\"file\":\"delft3d.log\"},\"sediment_fraction_images\":{\"images\":[],\"location\":\"process/\"}},\"parameters\":{\"engine\":{\"name\":\"Model Engine\",\"value\":\"Delft3D Curvilinear\"},\"simstoptime\":{\"units\":\"days\",\"name\":\"Stop time\",\"value\":60},\"tidalamplitude\":{\"units\":\"m\",\"name\":\"Tidal amplitude\",\"value\":1},\"version\":{\"name\":\"Version\",\"value\":\"v0.1\"},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"name\":\"River discharge\",\"value\":1000},\"template\":{\"value\":\"Basin fill\"},\"riverwidth\":{\"units\":\"m\",\"name\":\"River width\",\"value\":300},\"basinslope\":{\"units\":\"deg\",\"name\":\"Basin slope\",\"value\":0.0143},\"composition\":{\"name\":\"Sediment classes\",\"value\":\"medium-sand\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"outputinterval\":{\"units\":\"days\",\"name\":\"Output timestep\",\"value\":1,\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"}},\"task_id\":\"\",\"workingdir\":\"/data/container/files/ca9a22df-05ef-4c50-9561-dc39c85bfc45/\"},{\"id\":909,\"name\":\"Basin Fill Scenario: Run 1\",\"state\":\"ABORTED\",\"progress\":0,\"owner\":{\"id\":500,\"username\":\"foo\",\"first_name\":\"Foo\",\"last_name\":\"User\",\"email\":\"foo@bar.com\",\"groups\":[42,500]},\"shared\":\"c\",\"suid\":\"ca9a22df-05ef-4c50-9561-dc39c85bfc45\",\"scenario\":[381,382,379,384,386,388],\"fileurl\":\"/files/ca9a22df-05ef-4c50-9561-dc39c85bfc45/\",\"info\":{\"procruns\":1,\"simulation\":{\"info\":{\"model_id\":\"88a98ead-446c-450e-a16f-ce8a83e687ba\",\"task\":\"simulation\",\"log\":[{\"progressprev\":\"0.00\",\"level\":\"INFO\",\"progresshigh\":\"0.00\",\"levelhigh\":\"INFO\",\"messages\":[\"  Time to finish  1d 14h,    0.1% completed, time steps left  86307\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86306\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86305\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86303\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86302\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":\"0.00\",\"message\":\"  Time to finish  1d 14h,    0.1% completed, time steps left  86302\",\"latesterror\":\"\"},{\"progressprev\":0,\"level\":\"INFO\",\"progresshigh\":0,\"levelhigh\":\"INFO\",\"messages\":[\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":0,\"message\":\"INFO:__main__:use container directory structure\",\"latesterror\":\"\"}],\"procruns\":1,\"container_id\":{\"processing\":\"568d2d326706a0070ee8b25daeca4b3d09aee79bd542110d0dbff09d0d4e5c07\",\"simulation\":\"acfa7f1045ed3e3aa387d7b01728e6628cde096c925cca46d95c3d32596a635e\"},\"output\":\"\"},\"state\":\"PROCESSING\"},\"delta_fringe_images\":{\"images\":[],\"location\":\"process/\"},\"preprocess\":{\"info\":{\"model_id\":\"eb230e8e-9278-4029-a54e-a8699c5e5bb1\",\"task\":\"preprocess\",\"log\":{\"progressprev\":0,\"level\":\"INFO\",\"progresshigh\":0,\"levelhigh\":\"INFO\",\"messages\":[\"\",\"A    svn/template/testing_template/coarse-silt.mdf\",\"INFO:__main__:Finish preprocessing: 100% done\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":0,\"message\":\"INFO:__main__:Finish preprocessing: 100% done\",\"latesterror\":\"\"},\"container_id\":\"30e60fa70e72db201a1ba979baaa670a84430c5fb6081434f9a9f99fce1ddc20\",\"output\":\"\"},\"state\":\"SUCCESS\"},\"channel_network_images\":{\"images\":[],\"location\":\"process/\"},\"logfile\":{\"location\":\"simulation/\",\"file\":\"delft3d.log\"},\"sediment_fraction_images\":{\"images\":[],\"location\":\"process/\"}},\"parameters\":{\"engine\":{\"name\":\"Model Engine\",\"value\":\"Delft3D Curvilinear\"},\"simstoptime\":{\"units\":\"days\",\"name\":\"Stop time\",\"value\":60},\"tidalamplitude\":{\"units\":\"m\",\"name\":\"Tidal amplitude\",\"value\":1},\"version\":{\"name\":\"Version\",\"value\":\"v0.1\"},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"name\":\"River discharge\",\"value\":1000},\"template\":{\"value\":\"Basin fill\"},\"riverwidth\":{\"units\":\"m\",\"name\":\"River width\",\"value\":300},\"basinslope\":{\"units\":\"deg\",\"name\":\"Basin slope\",\"value\":0.0143},\"composition\":{\"name\":\"Sediment classes\",\"value\":\"medium-sand\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"outputinterval\":{\"units\":\"days\",\"name\":\"Output timestep\",\"value\":1,\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"}},\"task_id\":\"\",\"workingdir\":\"/data/container/files/ca9a22df-05ef-4c50-9561-dc39c85bfc45/\"},{\"id\":909,\"name\":\"Basin Fill Scenario: Run 1\",\"state\":\"ABORTED\",\"progress\":0,\"owner\":{\"id\":500,\"username\":\"foo\",\"first_name\":\"Foo\",\"last_name\":\"User\",\"email\":\"foo@bar.com\",\"groups\":[42,500]},\"shared\":\"c\",\"suid\":\"ca9a22df-05ef-4c50-9561-dc39c85bfc45\",\"scenario\":[381,382,379,384,386,388],\"fileurl\":\"/files/ca9a22df-05ef-4c50-9561-dc39c85bfc45/\",\"info\":{\"procruns\":1,\"simulation\":{\"info\":{\"model_id\":\"88a98ead-446c-450e-a16f-ce8a83e687ba\",\"task\":\"simulation\",\"log\":[{\"progressprev\":\"0.00\",\"level\":\"INFO\",\"progresshigh\":\"0.00\",\"levelhigh\":\"INFO\",\"messages\":[\"  Time to finish  1d 14h,    0.1% completed, time steps left  86307\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86306\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86305\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86303\",\"  Time to finish  1d 14h,    0.1% completed, time steps left  86302\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":\"0.00\",\"message\":\"  Time to finish  1d 14h,    0.1% completed, time steps left  86302\",\"latesterror\":\"\"},{\"progressprev\":0,\"level\":\"INFO\",\"progresshigh\":0,\"levelhigh\":\"INFO\",\"messages\":[\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\",\"INFO:__main__:use container directory structure\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":0,\"message\":\"INFO:__main__:use container directory structure\",\"latesterror\":\"\"}],\"procruns\":1,\"container_id\":{\"processing\":\"568d2d326706a0070ee8b25daeca4b3d09aee79bd542110d0dbff09d0d4e5c07\",\"simulation\":\"acfa7f1045ed3e3aa387d7b01728e6628cde096c925cca46d95c3d32596a635e\"},\"output\":\"\"},\"state\":\"PROCESSING\"},\"delta_fringe_images\":{\"images\":[],\"location\":\"process/\"},\"preprocess\":{\"info\":{\"model_id\":\"eb230e8e-9278-4029-a54e-a8699c5e5bb1\",\"task\":\"preprocess\",\"log\":{\"progressprev\":0,\"level\":\"INFO\",\"progresshigh\":0,\"levelhigh\":\"INFO\",\"messages\":[\"\",\"A    svn/template/testing_template/coarse-silt.mdf\",\"INFO:__main__:Finish preprocessing: 100% done\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":0,\"message\":\"INFO:__main__:Finish preprocessing: 100% done\",\"latesterror\":\"\"},\"container_id\":\"30e60fa70e72db201a1ba979baaa670a84430c5fb6081434f9a9f99fce1ddc20\",\"output\":\"\"},\"state\":\"SUCCESS\"},\"channel_network_images\":{\"images\":[],\"location\":\"process/\"},\"logfile\":{\"location\":\"simulation/\",\"file\":\"delft3d.log\"},\"sediment_fraction_images\":{\"images\":[],\"location\":\"process/\"}},\"parameters\":{\"engine\":{\"name\":\"Model Engine\",\"value\":\"Delft3D Curvilinear\"},\"simstoptime\":{\"units\":\"days\",\"name\":\"Stop time\",\"value\":60},\"tidalamplitude\":{\"units\":\"m\",\"name\":\"Tidal amplitude\",\"value\":1},\"version\":{\"name\":\"Version\",\"value\":\"v0.1\"},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"name\":\"River discharge\",\"value\":1000},\"template\":{\"value\":\"Basin fill\"},\"riverwidth\":{\"units\":\"m\",\"name\":\"River width\",\"value\":300},\"basinslope\":{\"units\":\"deg\",\"name\":\"Basin slope\",\"value\":0.0143},\"composition\":{\"name\":\"Sediment classes\",\"value\":\"medium-sand\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"outputinterval\":{\"units\":\"days\",\"name\":\"Output timestep\",\"value\":1,\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"}},\"task_id\":\"\",\"workingdir\":\"/data/container/files/ca9a22df-05ef-4c50-9561-dc39c85bfc45/\"},{\"id\":910,\"name\":\"Basin Fill Scenario: Run 2\",\"state\":\"INACTIVE\",\"progress\":0,\"owner\":{\"id\":500,\"username\":\"foo\",\"first_name\":\"Foo\",\"last_name\":\"User\",\"email\":\"foo@bar.com\",\"groups\":[42,500]},\"shared\":\"p\",\"suid\":\"9350fbaa-9a66-4c9c-8a31-f782d0796da7\",\"scenario\":[382],\"fileurl\":\"/files/9350fbaa-9a66-4c9c-8a31-f782d0796da7/\",\"info\":{\"channel_network_images\":{\"images\":[],\"location\":\"process/\"},\"logfile\":{\"location\":\"simulation/\",\"file\":\"\"},\"procruns\":0,\"delta_fringe_images\":{\"images\":[],\"location\":\"process/\"},\"sediment_fraction_images\":{\"images\":[],\"location\":\"process/\"}},\"parameters\":{\"engine\":{\"name\":\"Model Engine\",\"value\":\"Delft3D Curvilinear\"},\"simstoptime\":{\"units\":\"days\",\"name\":\"Stop time\",\"value\":60},\"composition\":{\"name\":\"Sediment classes\",\"value\":\"medium-sand\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"version\":{\"name\":\"Version\",\"value\":\"v0.1\"},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"name\":\"River discharge\",\"value\":1000},\"template\":{\"value\":\"Basin fill\"},\"riverwidth\":{\"units\":\"m\",\"name\":\"River width\",\"value\":400},\"basinslope\":{\"units\":\"deg\",\"name\":\"Basin slope\",\"value\":0.0143},\"tidalamplitude\":{\"units\":\"m\",\"name\":\"Tidal amplitude\",\"value\":1},\"outputinterval\":{\"units\":\"days\",\"name\":\"Output timestep\",\"value\":1,\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"}},\"task_id\":\"039da767-e485-48db-a3ca-c13127364d99\",\"workingdir\":\"/data/container/files/9350fbaa-9a66-4c9c-8a31-f782d0796da7/\"},{\"id\":911,\"name\":\"Basin Fill Scenario: Run 3\",\"state\":\"INACTIVE\",\"progress\":0,\"owner\":{\"id\":500,\"username\":\"foo\",\"first_name\":\"Foo\",\"last_name\":\"User\",\"email\":\"foo@bar.com\",\"groups\":[42,500]},\"shared\":\"p\",\"suid\":\"a9b99e7f-f1bf-459f-b4f8-3538c82bc10b\",\"scenario\":[382,388],\"fileurl\":\"/files/a9b99e7f-f1bf-459f-b4f8-3538c82bc10b/\",\"info\":{\"channel_network_images\":{\"images\":[],\"location\":\"process/\"},\"logfile\":{\"location\":\"simulation/\",\"file\":\"\"},\"delta_fringe_images\":{\"images\":[],\"location\":\"process/\"},\"procruns\":0,\"sediment_fraction_images\":{\"images\":[],\"location\":\"process/\"}},\"parameters\":{\"engine\":{\"name\":\"Model Engine\",\"value\":\"Delft3D Curvilinear\"},\"simstoptime\":{\"units\":\"days\",\"name\":\"Stop time\",\"value\":60},\"tidalamplitude\":{\"units\":\"m\",\"name\":\"Tidal amplitude\",\"value\":1},\"version\":{\"name\":\"Version\",\"value\":\"v0.1\"},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"name\":\"River discharge\",\"value\":1000},\"template\":{\"value\":\"Basin fill\"},\"riverwidth\":{\"units\":\"m\",\"name\":\"River width\",\"value\":500},\"basinslope\":{\"units\":\"deg\",\"name\":\"Basin slope\",\"value\":0.0143},\"composition\":{\"name\":\"Sediment classes\",\"value\":\"medium-sand\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"outputinterval\":{\"units\":\"days\",\"name\":\"Output timestep\",\"value\":1,\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"}},\"task_id\":\"126a143d-ea51-4b5f-98fa-b1dd29fa3f57\",\"workingdir\":\"/data/container/files/a9b99e7f-f1bf-459f-b4f8-3538c82bc10b/\"},{\"id\":911,\"name\":\"Basin Fill Scenario: Run 3\",\"state\":\"INACTIVE\",\"progress\":0,\"owner\":{\"id\":500,\"username\":\"foo\",\"first_name\":\"Foo\",\"last_name\":\"User\",\"email\":\"foo@bar.com\",\"groups\":[42,500]},\"shared\":\"p\",\"suid\":\"a9b99e7f-f1bf-459f-b4f8-3538c82bc10b\",\"scenario\":[382,388],\"fileurl\":\"/files/a9b99e7f-f1bf-459f-b4f8-3538c82bc10b/\",\"info\":{\"channel_network_images\":{\"images\":[],\"location\":\"process/\"},\"logfile\":{\"location\":\"simulation/\",\"file\":\"\"},\"delta_fringe_images\":{\"images\":[],\"location\":\"process/\"},\"procruns\":0,\"sediment_fraction_images\":{\"images\":[],\"location\":\"process/\"}},\"parameters\":{\"engine\":{\"name\":\"Model Engine\",\"value\":\"Delft3D Curvilinear\"},\"simstoptime\":{\"units\":\"days\",\"name\":\"Stop time\",\"value\":60},\"tidalamplitude\":{\"units\":\"m\",\"name\":\"Tidal amplitude\",\"value\":1},\"version\":{\"name\":\"Version\",\"value\":\"v0.1\"},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"name\":\"River discharge\",\"value\":1000},\"template\":{\"value\":\"Basin fill\"},\"riverwidth\":{\"units\":\"m\",\"name\":\"River width\",\"value\":500},\"basinslope\":{\"units\":\"deg\",\"name\":\"Basin slope\",\"value\":0.0143},\"composition\":{\"name\":\"Sediment classes\",\"value\":\"medium-sand\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"outputinterval\":{\"units\":\"days\",\"name\":\"Output timestep\",\"value\":1,\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"}},\"task_id\":\"126a143d-ea51-4b5f-98fa-b1dd29fa3f57\",\"workingdir\":\"/data/container/files/a9b99e7f-f1bf-459f-b4f8-3538c82bc10b/\"},{\"id\":912,\"name\":\"Basin Fill Scenario: Run 4\",\"state\":\"INACTIVE\",\"progress\":0,\"owner\":{\"id\":500,\"username\":\"foo\",\"first_name\":\"Foo\",\"last_name\":\"User\",\"email\":\"foo@bar.com\",\"groups\":[42,500]},\"shared\":\"p\",\"suid\":\"cdd2d7d4-757c-42de-9c9a-4384d06ab4de\",\"scenario\":[382,388],\"fileurl\":\"/files/cdd2d7d4-757c-42de-9c9a-4384d06ab4de/\",\"info\":{\"channel_network_images\":{\"images\":[],\"location\":\"process/\"},\"logfile\":{\"location\":\"simulation/\",\"file\":\"delft3d.log\"},\"procruns\":0,\"delta_fringe_images\":{\"images\":[],\"location\":\"process/\"},\"sediment_fraction_images\":{\"images\":[],\"location\":\"process/\"}},\"parameters\":{\"engine\":{\"name\":\"Model Engine\",\"value\":\"Delft3D Curvilinear\"},\"simstoptime\":{\"units\":\"days\",\"name\":\"Stop time\",\"value\":60},\"composition\":{\"name\":\"Sediment classes\",\"value\":\"medium-sand\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"version\":{\"name\":\"Version\",\"value\":\"v0.1\"},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"name\":\"River discharge\",\"value\":1000},\"template\":{\"value\":\"Basin fill\"},\"riverwidth\":{\"units\":\"m\",\"name\":\"River width\",\"value\":600},\"basinslope\":{\"units\":\"deg\",\"name\":\"Basin slope\",\"value\":0.0143},\"tidalamplitude\":{\"units\":\"m\",\"name\":\"Tidal amplitude\",\"value\":1},\"outputinterval\":{\"units\":\"days\",\"name\":\"Output timestep\",\"value\":1,\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"}},\"task_id\":\"ad1227fe-6587-4886-b286-b2e623696293\",\"workingdir\":\"/data/container/files/cdd2d7d4-757c-42de-9c9a-4384d06ab4de/\"},{\"id\":912,\"name\":\"Basin Fill Scenario: Run 4\",\"state\":\"INACTIVE\",\"progress\":0,\"owner\":{\"id\":500,\"username\":\"foo\",\"first_name\":\"Foo\",\"last_name\":\"User\",\"email\":\"foo@bar.com\",\"groups\":[42,500]},\"shared\":\"p\",\"suid\":\"cdd2d7d4-757c-42de-9c9a-4384d06ab4de\",\"scenario\":[382,388],\"fileurl\":\"/files/cdd2d7d4-757c-42de-9c9a-4384d06ab4de/\",\"info\":{\"channel_network_images\":{\"images\":[],\"location\":\"process/\"},\"logfile\":{\"location\":\"simulation/\",\"file\":\"delft3d.log\"},\"procruns\":0,\"delta_fringe_images\":{\"images\":[],\"location\":\"process/\"},\"sediment_fraction_images\":{\"images\":[],\"location\":\"process/\"}},\"parameters\":{\"engine\":{\"name\":\"Model Engine\",\"value\":\"Delft3D Curvilinear\"},\"simstoptime\":{\"units\":\"days\",\"name\":\"Stop time\",\"value\":60},\"composition\":{\"name\":\"Sediment classes\",\"value\":\"medium-sand\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"version\":{\"name\":\"Version\",\"value\":\"v0.1\"},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"name\":\"River discharge\",\"value\":1000},\"template\":{\"value\":\"Basin fill\"},\"riverwidth\":{\"units\":\"m\",\"name\":\"River width\",\"value\":600},\"basinslope\":{\"units\":\"deg\",\"name\":\"Basin slope\",\"value\":0.0143},\"tidalamplitude\":{\"units\":\"m\",\"name\":\"Tidal amplitude\",\"value\":1},\"outputinterval\":{\"units\":\"days\",\"name\":\"Output timestep\",\"value\":1,\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"}},\"task_id\":\"ad1227fe-6587-4886-b286-b2e623696293\",\"workingdir\":\"/data/container/files/cdd2d7d4-757c-42de-9c9a-4384d06ab4de/\"},{\"id\":913,\"name\":\"Basin Fill Scenario: Run 5\",\"state\":\"INACTIVE\",\"progress\":0,\"owner\":{\"id\":500,\"username\":\"foo\",\"first_name\":\"Foo\",\"last_name\":\"User\",\"email\":\"foo@bar.com\",\"groups\":[42,500]},\"shared\":\"p\",\"suid\":\"3affdf5f-4deb-4748-90f1-d3625684148f\",\"scenario\":[382],\"fileurl\":\"/files/3affdf5f-4deb-4748-90f1-d3625684148f/\",\"info\":{\"channel_network_images\":{\"images\":[],\"location\":\"process/\"},\"logfile\":{\"location\":\"simulation/\",\"file\":\"\"},\"delta_fringe_images\":{\"images\":[],\"location\":\"process/\"},\"procruns\":0,\"sediment_fraction_images\":{\"images\":[],\"location\":\"process/\"}},\"parameters\":{\"engine\":{\"name\":\"Model Engine\",\"value\":\"Delft3D Curvilinear\"},\"simstoptime\":{\"units\":\"days\",\"name\":\"Stop time\",\"value\":60},\"tidalamplitude\":{\"units\":\"m\",\"name\":\"Tidal amplitude\",\"value\":1},\"version\":{\"name\":\"Version\",\"value\":\"v0.1\"},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"name\":\"River discharge\",\"value\":1000},\"template\":{\"value\":\"Basin fill\"},\"riverwidth\":{\"units\":\"m\",\"name\":\"River width\",\"value\":700},\"basinslope\":{\"units\":\"deg\",\"name\":\"Basin slope\",\"value\":0.0143},\"composition\":{\"name\":\"Sediment classes\",\"value\":\"medium-sand\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"outputinterval\":{\"units\":\"days\",\"name\":\"Output timestep\",\"value\":1,\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"}},\"task_id\":\"13ced207-9ce3-4805-9946-f1be42a24bb1\",\"workingdir\":\"/data/container/files/3affdf5f-4deb-4748-90f1-d3625684148f/\"},{\"id\":914,\"name\":\"Basin Fill Scenario: Run 1\",\"state\":\"ABORTED\",\"progress\":0,\"owner\":{\"id\":500,\"username\":\"foo\",\"first_name\":\"Foo\",\"last_name\":\"User\",\"email\":\"foo@bar.com\",\"groups\":[42,500]},\"shared\":\"w\",\"suid\":\"c902592e-789b-48fa-8dfb-911070e6966e\",\"scenario\":[383,380],\"fileurl\":\"/files/c902592e-789b-48fa-8dfb-911070e6966e/\",\"info\":{\"procruns\":0,\"delta_fringe_images\":{\"images\":[],\"location\":\"process/\"},\"preprocess\":{\"info\":{\"model_id\":\"61774c99-9563-42b1-9c8c-9c7f9fe5b685\",\"task\":\"preprocess\",\"log\":{\"progressprev\":0,\"level\":\"Make\",\"progresshigh\":0,\"levelhigh\":\"\",\"messages\":[\"Make checkout of subversion repository\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":0,\"message\":\"Make checkout of subversion repository\",\"latesterror\":\"\"},\"container_id\":\"1e08c08fc6b18f1b52d93628fe4f7a6777b0638cc74e477a87c945f83d479c15\",\"output\":\"\"},\"state\":\"PROCESSING\"},\"channel_network_images\":{\"images\":[],\"location\":\"process/\"},\"logfile\":{\"location\":\"simulation/\",\"file\":\"\"},\"sediment_fraction_images\":{\"images\":[],\"location\":\"process/\"}},\"parameters\":{\"engine\":{\"name\":\"Model Engine\",\"value\":\"Delft3D Curvilinear\"},\"simstoptime\":{\"units\":\"days\",\"name\":\"Stop time\",\"value\":60},\"tidalamplitude\":{\"units\":\"m\",\"name\":\"Tidal amplitude\",\"value\":1},\"version\":{\"name\":\"Version\",\"value\":\"v0.1\"},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"name\":\"River discharge\",\"value\":1000},\"template\":{\"value\":\"Basin fill\"},\"riverwidth\":{\"units\":\"m\",\"name\":\"River width\",\"value\":555},\"basinslope\":{\"units\":\"deg\",\"name\":\"Basin slope\",\"value\":0.0143},\"composition\":{\"name\":\"Sediment classes\",\"value\":\"medium-sand\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"outputinterval\":{\"units\":\"days\",\"name\":\"Output timestep\",\"value\":1,\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"}},\"task_id\":\"\",\"workingdir\":\"/data/container/files/c902592e-789b-48fa-8dfb-911070e6966e/\"},{\"id\":914,\"name\":\"Basin Fill Scenario: Run 1\",\"state\":\"ABORTED\",\"progress\":0,\"owner\":{\"id\":500,\"username\":\"foo\",\"first_name\":\"Foo\",\"last_name\":\"User\",\"email\":\"foo@bar.com\",\"groups\":[42,500]},\"shared\":\"w\",\"suid\":\"c902592e-789b-48fa-8dfb-911070e6966e\",\"scenario\":[383,380],\"fileurl\":\"/files/c902592e-789b-48fa-8dfb-911070e6966e/\",\"info\":{\"procruns\":0,\"delta_fringe_images\":{\"images\":[],\"location\":\"process/\"},\"preprocess\":{\"info\":{\"model_id\":\"61774c99-9563-42b1-9c8c-9c7f9fe5b685\",\"task\":\"preprocess\",\"log\":{\"progressprev\":0,\"level\":\"Make\",\"progresshigh\":0,\"levelhigh\":\"\",\"messages\":[\"Make checkout of subversion repository\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":0,\"message\":\"Make checkout of subversion repository\",\"latesterror\":\"\"},\"container_id\":\"1e08c08fc6b18f1b52d93628fe4f7a6777b0638cc74e477a87c945f83d479c15\",\"output\":\"\"},\"state\":\"PROCESSING\"},\"channel_network_images\":{\"images\":[],\"location\":\"process/\"},\"logfile\":{\"location\":\"simulation/\",\"file\":\"\"},\"sediment_fraction_images\":{\"images\":[],\"location\":\"process/\"}},\"parameters\":{\"engine\":{\"name\":\"Model Engine\",\"value\":\"Delft3D Curvilinear\"},\"simstoptime\":{\"units\":\"days\",\"name\":\"Stop time\",\"value\":60},\"tidalamplitude\":{\"units\":\"m\",\"name\":\"Tidal amplitude\",\"value\":1},\"version\":{\"name\":\"Version\",\"value\":\"v0.1\"},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"name\":\"River discharge\",\"value\":1000},\"template\":{\"value\":\"Basin fill\"},\"riverwidth\":{\"units\":\"m\",\"name\":\"River width\",\"value\":555},\"basinslope\":{\"units\":\"deg\",\"name\":\"Basin slope\",\"value\":0.0143},\"composition\":{\"name\":\"Sediment classes\",\"value\":\"medium-sand\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"outputinterval\":{\"units\":\"days\",\"name\":\"Output timestep\",\"value\":1,\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"}},\"task_id\":\"\",\"workingdir\":\"/data/container/files/c902592e-789b-48fa-8dfb-911070e6966e/\"},{\"id\":915,\"name\":\"Test Basin Fill Scenario: Run 1\",\"state\":\"PROCESSING\",\"progress\":28,\"owner\":{\"id\":500,\"username\":\"foo\",\"first_name\":\"Foo\",\"last_name\":\"User\",\"email\":\"foo@bar.com\",\"groups\":[42,500]},\"shared\":\"p\",\"suid\":\"9170bfd3-4cd9-4cf5-bbeb-b6e835903ad8\",\"scenario\":[389],\"fileurl\":\"/files/9170bfd3-4cd9-4cf5-bbeb-b6e835903ad8/\",\"info\":{\"procruns\":10,\"simulation\":{\"info\":{\"model_id\":\"f31963be-5ee1-4419-a62e-358c4d55d6df\",\"task\":\"simulation\",\"log\":[{\"progressprev\":\"0.28\",\"level\":\"INFO\",\"progresshigh\":\"0.29\",\"levelhigh\":\"INFO\",\"messages\":[\"  Time to finish  15m,   27.8% completed, time steps left  433\",\"  Time to finish  15m,   28.0% completed, time steps left  432\",\"  Time to finish  15m,   28.2% completed, time steps left  431\",\"  Time to finish  15m,   28.5% completed, time steps left  429\",\"  Time to finish  15m,   28.7% completed, time steps left  428\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":\"0.29\",\"message\":\"  Time to finish  15m,   28.7% completed, time steps left  428\",\"latesterror\":\"\"},{\"progressprev\":0,\"level\":\"INFO\",\"progresshigh\":0,\"levelhigh\":\"WARNING\",\"messages\":[\"INFO:__main__:Start creating patches\",\"INFO:__main__:Start creating patches\",\"INFO:__main__:Start creating patches\",\"INFO:__main__:Start creating patches\",\"INFO:__main__:Start creating patches\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":0,\"message\":\"INFO:__main__:Start creating patches\",\"latesterror\":\"\"}],\"procruns\":10,\"container_id\":{\"processing\":\"448ba2792070a73dfda15dbaaf06e463a0e1099783c4f619cd0d067c9e78990d\",\"simulation\":\"4b91c3343d5bac12989e086c1c51fe4cc44ad51856862f35ffae604a379b526c\"},\"output\":\"\"},\"state\":\"PROCESSING\"},\"delta_fringe_images\":{\"images\":[\"delta_fringe_20140101000000.png\",\"delta_fringe_20140101003000.png\",\"delta_fringe_20140101010000.png\"],\"location\":\"process/\"},\"preprocess\":{\"info\":{\"model_id\":\"5730efb8-2232-4cde-bf43-027501c17a33\",\"task\":\"preprocess\",\"log\":{\"progressprev\":0,\"level\":\"INFO\",\"progresshigh\":0,\"levelhigh\":\"INFO\",\"messages\":[\"Make checkout of subversion repository\",\"INFO:__main__:Finish preprocessing: 100% done\"],\"states\":[\"STARTED\"],\"state\":\"STARTED\",\"progress\":0,\"message\":\"INFO:__main__:Finish preprocessing: 100% done\",\"latesterror\":\"\"},\"container_id\":\"94c948df649c27231f011f62ee7ec855d364a3697738475fb3f636ee33dd7e38\",\"output\":\"\"},\"state\":\"SUCCESS\"},\"channel_network_images\":{\"images\":[\"channel_network_20140101000000.png\",\"channel_network_20140101003000.png\",\"channel_network_20140101010000.png\"],\"location\":\"process/\"},\"logfile\":{\"location\":\"simulation/\",\"file\":\"delft3d.log\"},\"sediment_fraction_images\":{\"images\":[\"sediment_fraction_20140101000000.png\",\"sediment_fraction_20140101003000.png\",\"sediment_fraction_20140101010000.png\"],\"location\":\"process/\"}},\"parameters\":{\"simstoptime\":{\"units\":\"days\",\"name\":\"Stop time\",\"value\":60},\"tidalamplitude\":{\"units\":\"m\",\"name\":\"Tidal amplitude\",\"value\":1},\"riverdischarge\":{\"units\":\"mÂ³/s\",\"name\":\"River discharge\",\"value\":1000},\"template\":{\"value\":\"Testing template\"},\"riverwidth\":{\"units\":\"m\",\"name\":\"River width\",\"value\":300},\"dt\":{\"units\":\"min\",\"name\":\"Timestep\",\"value\":2},\"composition\":{\"name\":\"Sediment classes\",\"value\":\"medium-sand\",\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\"},\"outputinterval\":{\"units\":\"days\",\"name\":\"Output timestep\",\"value\":1,\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\"},\"basinslope\":{\"units\":\"deg\",\"name\":\"Basin slope\",\"value\":0.04}},\"task_id\":\"ce909f87-98fa-4dfc-af43-1758df7ec210\",\"workingdir\":\"/data/container/files/9170bfd3-4cd9-4cf5-bbeb-b6e835903ad8/\"}]");
        });

      searchDetails.$dispatch = function(ev) {

        // We should measure the run or sdcenario count knowing the above. But somehow the arguments are not accessible right now?
        assert.isTrue(ev === "modelsFound", "event has been dispatched");
        done();
      };

      searchDetails.startSearch();

      // we expect two replies.
      window.setTimeout(function() {
        try {

          console.log("Waiting for event...");

        } catch (e) {
          done(e);
        }
      }, 100);

    });





  });
  describe("User details", function() {
    it("Is possible to create a user details", function(done) {
      var userDetails = new UserDetails();

      assert.isOk(userDetails);
      done();
    });
  });

  describe("ScenarioCreate - Scenario builder", function() {

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


    // Check if we can call the init fixed toolbar
    it("Should be possible to call initFixedToolbar", function(done) {
      var scenarioCreate = new ScenarioCreate({
      });


      scenarioCreate.initFixedToolbar();

      assert.isOk(scenarioCreate.initFixedToolbar);

      done();
    });


    it("Should be possible to updateFixedToolbarStyle", function(done) {
      var scenarioCreate = new ScenarioCreate({
      });


      scenarioCreate.updateFixedToolbarStyle();

      assert.isOk(scenarioCreate.updateFixedToolbarStyle);

      done();
    });

    it("Should be possible to updateFixedToolbarStyle - scrolled down", function(done) {
      var scenarioCreate = new ScenarioCreate({
      });

      scenarioCreate.initFixedToolbar();
      // Fake a scrolling activity:
      var original = $.fn.scrollTop;

      $.fn.scrollTop = function() {
        return 1000;
      };

      scenarioCreate.navBars.topBar.clientHeight = 40;

      scenarioCreate.updateFixedToolbarStyle();

      assert.isOk(scenarioCreate.updateFixedToolbarStyle);

      // Original functoin again.
      $.fn.scrollTop = original;

      done();
    });



    it("Should be possible to call GetTop", function(done) {
      var scenarioCreate = new ScenarioCreate({
      });


      var top = scenarioCreate.getTop();

      // We do not have a window, so assume 0.
      assert.isTrue(top === 0);

      done();
    });


    it("Should be possible to call validform - TRUE", function(done) {
      var scenarioCreate = new ScenarioCreate({
      });

      scenarioCreate.$validation = {
        valid: true
      };

      assert.isTrue(scenarioCreate.validForm);

      done();
    });

    it("Should be possible to call validform - FALSE", function(done) {
      var scenarioCreate = new ScenarioCreate({
      });

      scenarioCreate.$validation = {
        valid: false
      };

      assert.isFalse(scenarioCreate.validForm);

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


    it("Should be possible to update with query parameters", function(done) {
      var scenarioCreate = new ScenarioCreate();

      scenarioCreate.updateWithQueryParameters();

      assert.isOk(scenarioCreate.scenarioConfig);

      done();
    });


    it("Should be possible to submit a scenario", function(done) {
      var scenarioCreate = new ScenarioCreate();

      // Set some vars:
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

      scenarioCreate.submitScenario();

      assert.isOk(scenarioCreate.scenarioConfig);

      done();
    });


    it("Should be possible to call updateAfterTick", function(done) {
      var scenarioCreate = new ScenarioCreate();

      assert.isOk(scenarioCreate.updateAfterTick);

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


    it("Should be possible to use getId ", function(done) {
      var scenarioCreate = new ScenarioCreate({
      });

      var variable = {
        id: "testvar"
      };

      scenarioCreate.scenarioConfig = {
        id: 1
      };

      var result = scenarioCreate.getId(variable);
      var expected = 1 + "," + variable.id;

      assert.isTrue(result === expected, "getId matches");

      done();

    });

    it("Should be possible to update with query parameters", function(done) {
      var scenarioCreate = new ScenarioCreate({
      });


      // fake the router
      scenarioCreate.$route = {};

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


    // Test if we can fetc htemplates through scenario builder
    // Later on it should maybe really use fake JSON to build scenarios.
    it("Should be possible to fetch templates", function(done) {
      var scenarioCreate = new ScenarioCreate();
      var correctReply = false;



      nock("http://0.0.0.0")
      .defaultReplyHeaders({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      })
      .get("/api/v1/templates/")
      .reply(200, function() {
        correctReply = true;
        return "[{\"id\":50,\"name\":\"Basin fill\",\"meta\":{\"description\":\"A river dominated and tidal influenced delta (no waves). No specific location. This is a delta like the Mississipi delta or the Mahakam river delta on East Kalimantan.\",\"creator\":\"fedor.baart@deltares.nl\"},\"sections\":[{\"variables\":[{\"default\":\"Basin Fill Scenario\",\"type\":\"text\",\"id\":\"name\",\"name\":\"Name\",\"validators\":{\"required\":true}},{\"name\":\"Model Engine\",\"default\":\"Delft3D Curvilinear\",\"disabled\":true,\"validators\":{\"required\":true},\"type\":\"text\",\"id\":\"engine\"},{\"name\":\"Version\",\"default\":\"v0.1\",\"disabled\":true,\"validators\":{\"required\":true},\"type\":\"semver\",\"id\":\"version\"}],\"name\":\"Scenario\"},{\"variables\":[{\"name\":\"Stop time\",\"default\":60,\"validators\":{\"max\":160,\"required\":true,\"min\":0},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"simstoptime\"},{\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\",\"default\":1,\"validators\":{\"max\":2,\"required\":true,\"min\":0.5},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"outputinterval\",\"name\":\"Output timestep\"}],\"name\":\"Parameters\"},{\"variables\":[{\"name\":\"Basin slope\",\"default\":0.0143,\"validators\":{\"max\":0.3,\"required\":true,\"min\":0.01},\"factor\":true,\"units\":\"deg\",\"type\":\"numeric\",\"id\":\"basinslope\"},{\"name\":\"River width\",\"default\":300,\"validators\":{\"max\":1000,\"required\":true,\"min\":100},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"riverwidth\"}],\"name\":\"Geometry\"},{\"variables\":[{\"name\":\"River discharge\",\"default\":1000,\"validators\":{\"max\":2000,\"required\":true,\"min\":0},\"factor\":true,\"units\":\"mÂ³/s\",\"type\":\"numeric\",\"id\":\"riverdischarge\"},{\"name\":\"Tidal amplitude\",\"default\":1,\"validators\":{\"max\":3,\"required\":true,\"min\":0},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"tidalamplitude\"}],\"name\":\"Forces\"},{\"variables\":[{\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\",\"default\":\"medium-sand\",\"id\":\"composition\",\"validators\":{},\"type\":\"select\",\"options\":[{\"text\":\"coarse-sand\",\"value\":\"coarse-sand\"},{\"text\":\"medium-sand\",\"value\":\"medium-sand\"},{\"text\":\"fine-sand\",\"value\":\"fine-sanday\"},{\"text\":\"coarse-silt\",\"value\":\"coarse-silt\"},{\"text\":\"medium-silt\",\"value\":\"medium-silt\"},{\"text\":\"fine-silt\",\"value\":\"fine-silt\"}],\"name\":\"Sediment classes\"}],\"name\":\"Sediment composition\",\"description\":\"Sediment can consist of a mixture of different classes. Read <a href='more'>more</a> about the sediment composition clasess.\"}]},{\"id\":51,\"name\":\"Basin fill with marine reworking\",\"meta\":{\"description\":\"A river or tide dominated delta with wind waves as a marine reworking force\",\"creator\":\"liang.li@tudelft.nl\"},\"sections\":[{\"variables\":[{\"default\":\"Basin Fill with Marine Reworking Scenario\",\"type\":\"text\",\"id\":\"name\",\"name\":\"Name\",\"validators\":{\"required\":true}},{\"name\":\"Model Engine\",\"default\":\"Delft3D Curvilinear\",\"disabled\":true,\"validators\":{\"required\":true},\"type\":\"text\",\"id\":\"engine\"},{\"name\":\"Version\",\"default\":\"v0.1\",\"disabled\":true,\"validators\":{\"required\":true},\"type\":\"semver\",\"id\":\"version\"}],\"name\":\"Scenario\"},{\"variables\":[{\"name\":\"Stop time\",\"default\":60,\"validators\":{\"max\":160,\"required\":true,\"min\":0},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"simstoptime\"},{\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\",\"default\":1,\"validators\":{\"max\":2,\"required\":true,\"min\":0.5},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"outputinterval\",\"name\":\"Output timestep\"}],\"name\":\"Parameters\"},{\"variables\":[{\"name\":\"Basin slope\",\"default\":0.0143,\"validators\":{\"max\":0.3,\"required\":true,\"min\":0.01},\"factor\":true,\"units\":\"deg\",\"type\":\"numeric\",\"id\":\"basinslope\"},{\"name\":\"River width\",\"default\":300,\"validators\":{\"max\":1000,\"required\":true,\"min\":100},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"riverwidth\"}],\"name\":\"Geometry\"},{\"variables\":[{\"name\":\"River discharge\",\"default\":1000,\"validators\":{\"max\":2000,\"required\":true,\"min\":0},\"factor\":true,\"units\":\"mÂ³/s\",\"type\":\"numeric\",\"id\":\"riverdischarge\"},{\"name\":\"Tidal amplitude\",\"default\":1,\"validators\":{\"max\":3,\"required\":true,\"min\":0},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"tidalamplitude\"}],\"name\":\"Forces\"},{\"variables\":[{\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\",\"default\":\"medium-sand\",\"id\":\"composition\",\"validators\":{},\"type\":\"select\",\"options\":[{\"text\":\"coarse-sand\",\"value\":\"coarse-sand\"},{\"text\":\"medium-sand\",\"value\":\"medium-sand\"},{\"text\":\"fine-sand\",\"value\":\"fine-sanday\"},{\"text\":\"coarse-silt\",\"value\":\"coarse-silt\"},{\"text\":\"medium-silt\",\"value\":\"medium-silt\"},{\"text\":\"fine-silt\",\"value\":\"fine-silt\"}],\"name\":\"Sediment classes\"}],\"name\":\"Sediment composition\",\"description\":\"Sediment can consist of a mixture of different classes. Read <a href='more'>more</a> about the sediment composition clasess.\"}]},{\"id\":52,\"name\":\"Testing template\",\"meta\":{\"description\":\"A river dominated and tidal influenced delta (no waves). No specific location. This is a delta like the Mississipi delta or the Mahakam river delta on East Kalimantan.\",\"creator\":\"fedor.baart@deltares.nl\"},\"sections\":[{\"variables\":[{\"default\":\"Test Basin Fill Scenario\",\"type\":\"text\",\"id\":\"name\",\"name\":\"Name\",\"validators\":{\"required\":true}},{\"name\":\"Timestep\",\"default\":2,\"validators\":{\"max\":20,\"required\":true,\"min\":0.5},\"units\":\"min\",\"type\":\"numeric\",\"id\":\"dt\"},{\"name\":\"Model Engine\",\"default\":\"Delft3D Curvilinear\",\"disabled\":true,\"validators\":{\"required\":true},\"type\":\"text\",\"id\":\"engine\"},{\"name\":\"Version\",\"default\":\"v0.1\",\"disabled\":true,\"validators\":{\"required\":true},\"type\":\"semver\",\"id\":\"version\"}],\"name\":\"Scenario\"},{\"variables\":[{\"name\":\"Stop time\",\"default\":60,\"validators\":{\"max\":160,\"required\":true,\"min\":0},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"simstoptime\"},{\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\",\"default\":1,\"validators\":{\"max\":2,\"required\":true,\"min\":0.5},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"outputinterval\",\"name\":\"Output timestep\"}],\"name\":\"Parameters\"},{\"variables\":[{\"name\":\"Basin slope\",\"default\":0.0143,\"validators\":{\"max\":0.3,\"required\":true,\"min\":0.01},\"factor\":true,\"units\":\"deg\",\"type\":\"numeric\",\"id\":\"basinslope\"},{\"name\":\"River width\",\"default\":300,\"validators\":{\"max\":1000,\"required\":true,\"min\":100},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"riverwidth\"}],\"name\":\"Geometry\"},{\"variables\":[{\"name\":\"River discharge\",\"default\":1000,\"validators\":{\"max\":2000,\"required\":true,\"min\":0},\"factor\":true,\"units\":\"mÂ³/s\",\"type\":\"numeric\",\"id\":\"riverdischarge\"},{\"name\":\"Tidal amplitude\",\"default\":1,\"validators\":{\"max\":3,\"required\":true,\"min\":0},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"tidalamplitude\"}],\"name\":\"Forces\"},{\"variables\":[{\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\",\"default\":\"medium-sand\",\"id\":\"composition\",\"validators\":{},\"type\":\"select\",\"options\":[{\"text\":\"coarse-sand\",\"value\":\"coarse-sand\"},{\"text\":\"medium-sand\",\"value\":\"medium-sand\"},{\"text\":\"fine-sand\",\"value\":\"fine-sanday\"},{\"text\":\"coarse-silt\",\"value\":\"coarse-silt\"},{\"text\":\"medium-silt\",\"value\":\"medium-silt\"},{\"text\":\"fine-silt\",\"value\":\"fine-silt\"}],\"name\":\"Sediment classes\"}],\"name\":\"Sediment composition\",\"description\":\"Sediment can consist of a mixture of different classes. Read <a href='more'>more</a> about the sediment composition clasess.\"}]}]";
      });

      scenarioCreate.fetchTemplateList();

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

  });


  describe("ModelDetails", function() {
    var modelDetails = new ModelDetails();


    it("Should be possible to fetchLog", function(done) {
      var correctReply = false;
      var id = 405;

      // We fake to get a model.
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
            name: "Run 1",
            fileurl: "/fileurl/",
              info: {
                logfile: {
                  location: "location/",
                  file: "file"
                }
              }
            }
        ]);

      global.fetchModel(id)
        .then(function(data) {

          // Now test the log
          modelDetails.model.id = id;

          // We refer to this item:
          //var model = itemsCache["4"];

          // Working dir is at: modeldata.fileurl + delf3d + delft3d.log
          var url = data.fileurl + data.info.logfile.location + data.info.logfile.file;

          nock("http://0.0.0.0")
            //.log(console.log)
            .defaultReplyHeaders({
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            })
            .get(url)
            .reply(200, function() {
              correctReply = true;
              return {};
            });

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



    it("Should be possible to fetchLog - NON existing model", function(done) {
      var id = 405;

      // We expect an error! As there are no models yet
      global.fetchLog(id).catch(function() {
        // We expect an error.
        done();
      });
    });


    // This function should not perform a request as there is no filelog yet!
    it("Should be possible to fetchLog - NO filelog yet", function(done) {
      var correctReply = true;
      var id = 405;

      // We fake to get a model.
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
            name: "Run 1",
            fileurl: "/fileurl/",
              info: {
                logfile: {
                  location: "location/",
                  file: "" // <-- this is the part we are testing.
                }
              }
            }
        ]);

      global.fetchModel(id)
        .then(function(data) {

          // Now test the log
          modelDetails.model.id = id;

          // We refer to this item:
          //var model = itemsCache["4"];

          // Working dir is at: modeldata.fileurl + delf3d + delft3d.log
          var url = data.fileurl + data.info.logfile.location + data.info.logfile.file;

          nock("http://0.0.0.0")
            //.log(console.log)
            .defaultReplyHeaders({
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            })
            .get(url)
            .reply(200, function() {
              correctReply = false; // We did not expect a reply!!
              return {};
            });

          modelDetails.fetchLog();

          // Make sure the nock server had the time to reply
          window.setTimeout(function() {
            try {
              assert(correctReply === true, "[x] No Ajax call performed");
              done();
            } catch (e) {
              done(e);
            }
          }, 100);


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


    // This version sends a invalid reponse to the fetchLog, we have to handle this.
    // Skip the UI part of this. just direct through global.
    it("Should be possible to fetchLog - EXPECT INVALID REPONSE", function(done) {

      //var correctReply = false;
      var id = 405;

      // We fake to get a model.
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
            name: "Run 1",
            fileurl: "/fileurl/",
              info: {
                logfile: {
                  location: "location/",
                  file: "file"
                }
              }
            }
        ]);

      global.fetchModel(id)
        .then(function(data) {

          // Now test the log
          modelDetails.model.id = id;

          // Working dir is at: modeldata.fileurl + delf3d + delft3d.log
          var url = data.fileurl + data.info.logfile.location + data.info.logfile.file;

          nock("http://0.0.0.0")
            //.log(console.log)
            .defaultReplyHeaders({
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            })
            .get(url)
            .reply(400, function() {
              return {};
            });

          global.fetchLog(id).catch(function() {

            // We expect an error.
            done();
          });
        });
    });



    it("Should be possible to delete a model", function(done) {

      var correctReply = false;

      var deleteID = 4;

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .intercept("/api/v1/scenes/" + deleteID + "/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
        .delete("/api/v1/scenes/" + deleteID + "/")
        .reply(200, function() {
          correctReply = true;
          return {};
        });

      global.deleteModel(deleteID);

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

    it("Should be possible to delete a model - FAILURE test", function(done) {

      var deleteID = 4;

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .intercept("/api/v1/scenes/" + deleteID + "/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
        .delete("/api/v1/scenes/" + deleteID + "/")
        .reply(400, function() {
          return {};
        });

      global.deleteModel(deleteID).catch(function() {
        // We expected an error.
        done();
      });


    });




    it("Should be possible to export a model", function(done) {
      var correctReply = false;

      modelDetails.model.id = 4;

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .intercept("/api/v1/scenes/4/start/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
        .put("/api/v1/scenes/4/start/", {
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

    it("Should be possible to export a model", function(done) {
      var correctReply = false;

      modelDetails.model.id = 4;

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .intercept("/api/v1/scenes/4/start/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
        .put("/api/v1/scenes/4/start/", {
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

    it("Should be possible to export a model - FAILURE test", function(done) {


      var modelToExport = 4;

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .intercept("/api/v1/scenes/4/start/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
        .put("/api/v1/scenes/4/start/", {
          workflow: "export"
        })
        .reply(400, function() {
          return {};
        });

      global.exportModel(modelToExport).catch(function() {
        // We expected an error.
        done();
      });

    });


    it("Should be possible to start a model - FAILURE test", function(done) {
      var modelToStart = 4;

      nock("http://0.0.0.0")
        //.log(console.log)
        // jquery calls OPTIONS first
        .intercept("/api/v1/scenes/" + modelToStart + "/start/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
        // Browsers (and jquery) expect the Access-Control-Allow-Origin header
        .defaultReplyHeaders({"Access-Control-Allow-Origin": "*"})
        .put("/api/v1/scenes/" + modelToStart + "/start/")
        .reply(400, function() {

          // We got the right reply:
          return {};
        });

      global.startModel(modelToStart).catch(function() {
        // We expected an error.
        done();
      });

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
          return "Allow: GET, HEAD, PUT, DELETE, POST";
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


    it("Should be possible to stop multiple models (stopruns)", function(done) {

      // When no id's passed, should return false.
      assert.isFalse(global.stopModels());
      done();
    });

    it("hould be possible to start multiple models (startModels)", function(done) {

      // For now check if function is ok.
      assert.isFalse(global.startModels());
      done();

    });

    it("Should be possible to delete  multiple models (deleteModels)", function(done) {

      // For now check if function is ok.
      assert.isFalse(global.deleteModels());
      done();
    });



    it("Should be possible to stop multiple models (stopruns) - also stop runs", function(done) {

      // Process these ids
      var ids = [1, 2];
      var correctCount = 0;
      var expectedCount = ids.length;

      // Mock the three requests:
      nock("http://0.0.0.0")
        // jquery calls OPTIONS first
        .intercept("/api/v1/scenes/" + ids[0] + "/stop/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
        // Browsers (and jquery) expect the Access-Control-Allow-Origin header
        .defaultReplyHeaders({"Access-Control-Allow-Origin": "*"})
        .put("/api/v1/scenes/" + ids[0] + "/stop/")
        .reply(200, function() {

          // We got the right reply:
          correctCount++;
          return {};
        })
        .intercept("/api/v1/scenes/" + ids[1] + "/stop/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
        // Browsers (and jquery) expect the Access-Control-Allow-Origin header
        .defaultReplyHeaders({"Access-Control-Allow-Origin": "*"})
        .put("/api/v1/scenes/" + ids[1] + "/stop/")
        .reply(200, function() {

          // We got the right reply:
          correctCount++;
          return {};
        })
       ;

      // Make sure the nock server had the time to reply
      window.setTimeout(function() {
        try {
          assert(correctCount === expectedCount, "Got all expected replies");
          done();
        } catch (e) {
          done(e);
        }
      }, 150);

      global.stopModels(ids);

    });

    it("Should be possible to start multiple models (startModels)  - also startModels runs", function(done) {

      // Process these ids
      var ids = [1, 2];
      var correctCount = 0;
      var expectedCount = ids.length;

      // Mock the three requests:
      nock("http://0.0.0.0")
        // jquery calls OPTIONS first
        .intercept("/api/v1/scenes/" + ids[0] + "/start/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
        // Browsers (and jquery) expect the Access-Control-Allow-Origin header
        .defaultReplyHeaders({"Access-Control-Allow-Origin": "*"})
        .put("/api/v1/scenes/" + ids[0] + "/start/")
        .reply(200, function() {

          // We got the right reply:
          correctCount++;
          return {};
        })
        .intercept("/api/v1/scenes/" + ids[1] + "/start/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
        // Browsers (and jquery) expect the Access-Control-Allow-Origin header
        .defaultReplyHeaders({"Access-Control-Allow-Origin": "*"})
        .put("/api/v1/scenes/" + ids[1] + "/start/")
        .reply(200, function() {

          // We got the right reply:
          correctCount++;
          return {};
        })
       ;

      // Make sure the nock server had the time to reply
      window.setTimeout(function() {
        try {
          assert(correctCount === expectedCount, "Got all expected replies");
          done();
        } catch (e) {
          done(e);
        }
      }, 150);

      global.startModels(ids);

    });

    it("Should be possible to delete  multiple models (deleteModels)  - also deleteModels runs", function(done) {

// Process these ids
      var ids = [1, 2];
      var correctCount = 0;
      var expectedCount = ids.length;

      // Mock the three requests:
      nock("http://0.0.0.0")
        // jquery calls OPTIONS first
        .intercept("/api/v1/scenes/" + ids[0] + "/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
        // Browsers (and jquery) expect the Access-Control-Allow-Origin header
        .defaultReplyHeaders({"Access-Control-Allow-Origin": "*"})
        .delete("/api/v1/scenes/" + ids[0] + "/")
        .reply(200, function() {

          // We got the right reply:
          correctCount++;
          return {};
        })
        .intercept("/api/v1/scenes/" + ids[1] + "/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
        // Browsers (and jquery) expect the Access-Control-Allow-Origin header
        .defaultReplyHeaders({"Access-Control-Allow-Origin": "*"})
        .delete("/api/v1/scenes/" + ids[1] + "/")
        .reply(200, function() {

          // We got the right reply:
          correctCount++;
          return {};
        })
       ;

      // Make sure the nock server had the time to reply
      window.setTimeout(function() {
        try {
          assert(correctCount === expectedCount, "Got all expected replies");
          done();
        } catch (e) {
          done(e);
        }
      }, 150);

      global.deleteModels(ids);

    });






    it("Should be possible to stop a model", function(done) {
      var correctReply = false;

      modelDetails = new ModelDetails();

      modelDetails.$parent = {};
      modelDetails.$parent.$broadcast = function() {
      };

      modelDetails.$root = {};
      modelDetails.$root.$broadcast = function() {
      };

      modelDetails.model.id = 4;

      // To get dialogs, manually have to create and add them to the component. So that is what we do here:
      var dialog = new ConfirmDialog();

      dialog.dialogId = "stop";
      modelDetails.$children.push(dialog);

      // End manual dialog.


      nock("http://0.0.0.0")
        //.log(console.log)
        // jquery calls OPTIONS first
        .intercept("/api/v1/scenes/" + modelDetails.model.id + "/stop/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
        // Browsers (and jquery) expect the Access-Control-Allow-Origin header
        .defaultReplyHeaders({"Access-Control-Allow-Origin": "*"})
        .put("/api/v1/scenes/" + modelDetails.model.id + "/stop/")
        .reply(200, function() {

          // We got the right reply:
          correctReply = true;
          return {};
        });

      // Make sure the nock server had the time to reply
      window.setTimeout(function() {
        try {
          assert(correctReply === true, "Nock server did not reach reply");
          done();
        } catch (e) {
          done(e);
        }
      }, 150);

      $("#dialog-container").load("/templates/confirm-dialog.html", function() {

        modelDetails.stopModel();

        // Find the dialog:
        var stopDialog = getDialog(modelDetails, "confirm-dialog", "stop");

        // confirm the dialog:
        stopDialog.onConfirm();
      });
    });


    it("Should be possible to stop a model - FAILURE test", function(done) {
      var modelToStop = 4;

      nock("http://0.0.0.0")
        //.log(console.log)
        // jquery calls OPTIONS first
        .intercept("/api/v1/scenes/" + modelToStop + "/stop/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
        // Browsers (and jquery) expect the Access-Control-Allow-Origin header
        .defaultReplyHeaders({"Access-Control-Allow-Origin": "*"})
        .put("/api/v1/scenes/" + modelToStop + "/stop/")
        .reply(400, function() {

          // We got the right reply:
          return {};
        });

      global.stopModel(modelToStop).catch(function() {
        // We expected an error.
        done();
      });

    });

    it("Should be possible to start a model - FAILURE test", function(done) {
      var modelToStart = 4;

      nock("http://0.0.0.0")
        //.log(console.log)
        // jquery calls OPTIONS first
        .intercept("/api/v1/scenes/" + modelToStart + "/start/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
        // Browsers (and jquery) expect the Access-Control-Allow-Origin header
        .defaultReplyHeaders({"Access-Control-Allow-Origin": "*"})
        .put("/api/v1/scenes/" + modelToStart + "/start/")
        .reply(400, function() {

          // We got the right reply:
          return {};
        });

      global.startModel(modelToStart).catch(function() {
        // We expected an error.
        done();
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


    it("Should be possible to get scenario property (calculated)", function(done) {

      var aModelDetails = new ModelDetails();


      // Should give -1 as default.
      assert.isTrue(aModelDetails.scenario === -1);

      done();
    });


    it("Should be possible to publish a model private using Confirm", function(done) {

      var correctReply = false;

      modelDetails = new ModelDetails();

      modelDetails.$parent = {};
      modelDetails.$parent.$broadcast = function() {
      };

      modelDetails.$root = {};
      modelDetails.$root.$broadcast = function() {
      };

      modelDetails.model.id = 4;

      // Publishlevel 2 = world

      var newPublishLevel = 2;
      var target = "world";

      // To get dialogs, manually have to create and add them to the component. So that is what we do here:
      var dialog = new ConfirmDialog();

      dialog.dialogId = "publish";
      modelDetails.$children.push(dialog);

      // End manual dialog.


      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .post("/api/v1/scenes/" + modelDetails.model.id + "/publish_" + target + "/")
        .reply(200, function() {
          correctReply = true;
          return {};
        });


      // Make sure the nock server had the time to reply
      window.setTimeout(function() {
        try {
          assert(correctReply === true, "Nock server did not reach reply");
          done();
        } catch (e) {
          done(e);
        }
      }, 150);

      $("#dialog-container").load("/templates/confirm-dialog.html", function() {

        modelDetails.publishModel(newPublishLevel);

        // Find the dialog:
        var publishDialog = getDialog(modelDetails, "confirm-dialog", "publish");

        // confirm the dialog:
        publishDialog.onConfirm();
      });
    });


    it("Should be possible to publish a model private using Confirm - FAILURE test", function(done) {

      modelDetails = new ModelDetails();

      modelDetails.$parent = {};
      modelDetails.$parent.$broadcast = function() {
        done("Broadcast should not have been called");
      };

      modelDetails.$root = {};
      modelDetails.$root.$broadcast = function() {
        done("Broadcast should not have been called");
      };

      modelDetails.model.id = 4;

      // Publishlevel 2 = world

      var newPublishLevel = 2;
      var target = "world";

      // To get dialogs, manually have to create and add them to the component. So that is what we do here:
      var dialog = new ConfirmDialog();

      dialog.dialogId = "publish";
      modelDetails.$children.push(dialog);

      // End manual dialog.


      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .post("/api/v1/scenes/" + modelDetails.model.id + "/publish_" + target + "/")
        .reply(400, function() { // We reply with 400
          return {};
        });


      // Make sure the nock server had the time to reply
      window.setTimeout(function() {
        done();

      }, 150);

      // We test if the continue code was still called by checking if a broadcast was executed.
      modelDetails.$parent = {};
      modelDetails.$parent.$broadcast = function() {
        done("Broadcast should not have been called");
      };

      modelDetails.$root = {};
      modelDetails.$root.$broadcast = function() {
        done("Broadcast should not have been called");
      };


      $("#dialog-container").load("/templates/confirm-dialog.html", function() {

        modelDetails.publishModel(newPublishLevel);

        // Find the dialog:
        var publishDialog = getDialog(modelDetails, "confirm-dialog", "publish");

        // confirm the dialog:
        publishDialog.onConfirm();
      });
    });



    it("Should be possible to publish a model private using Confirm", function(done) {

      var correctReply = false;

      modelDetails = new ModelDetails();

      modelDetails.$parent = {};
      modelDetails.$parent.$broadcast = function() {
      };

      modelDetails.$root = {};
      modelDetails.$root.$broadcast = function() {
      };

      modelDetails.model.id = 4;

      // Publishlevel 2 = world

      var newPublishLevel = 2;
      var target = "world";

      // To get dialogs, manually have to create and add them to the component. So that is what we do here:
      var dialog = new ConfirmDialog();

      dialog.dialogId = "publish";
      modelDetails.$children.push(dialog);

      // End manual dialog.


      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .post("/api/v1/scenes/" + modelDetails.model.id + "/publish_" + target + "/")
        .reply(200, function() {
          correctReply = true;
          return {};
        });


      // Make sure the nock server had the time to reply
      window.setTimeout(function() {
        try {
          assert(correctReply === true, "Nock server did not reach reply");
          done();
        } catch (e) {
          done(e);
        }
      }, 150);

      $("#dialog-container").load("/templates/confirm-dialog.html", function() {

        modelDetails.publishModel(newPublishLevel);

        // Find the dialog:
        var publishDialog = getDialog(modelDetails, "confirm-dialog", "publish");

        // confirm the dialog:
        publishDialog.onConfirm();
      });
    });



    it("Should be possible to publish a model private", function(done) {
      var correctReply = false;

      var modelToPublishId = 4;
      var target = "private";

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .post("/api/v1/scenes/" + modelToPublishId + "/publish_" + target + "/")
        .reply(200, function() {
          correctReply = true;
          return {};
        });

      global.publishModel(modelToPublishId, target);

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

    it("Should be possible to publish a model private - FAILURE test", function(done) {
      var modelToPublishId = 4;
      var target = "private";

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .post("/api/v1/scenes/" + modelToPublishId + "/publish_" + target + "/")
        .reply(400, function() {
          return {};
        });

      global.publishModel(modelToPublishId, target).catch(function() {
        // We expected an error.
        done();
      });



    });

    it("Should be possible to publish a model company", function(done) {
      var correctReply = false;

      modelDetails.$parent = {};
      modelDetails.$parent.$broadcast = function() {
      };

      var modelToPublishId = 4;
      var target = "company";

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .post("/api/v1/scenes/" + modelToPublishId + "/publish_" + target + "/")
        .reply(200, function() {
          correctReply = true;
          return {};
        });

      global.publishModel(modelToPublishId, target);

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

    it("Should be possible to publish a world company", function(done) {
      var correctReply = false;

      modelDetails.$parent = {};
      modelDetails.$parent.$broadcast = function() {
      };

      var modelToPublishId = 4;
      var target = "world";

      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .post("/api/v1/scenes/" + modelToPublishId + "/publish_" + target + "/")
        .reply(200, function() {
          correctReply = true;
          return {};
        });

      global.publishModel(modelToPublishId, target);

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

    it("Check publishlevel config", function(done) {

      var publishLevels = [
        {
          "indicator": "p",
          "url": "private",
          "iconClass": "glyphicon-people",
          "description": "Private"
        },
        {
          "indicator": "c",
          "url": "company",
          "iconClass": "glyphicon-blackboard",
          "description": "Company"
        },
        {
          "indicator": "w",
          "url": "world",
          "iconClass": "glyphicon-globe",
          "description": "Public"
        }
      ];

      var aModelDetails = new ModelDetails();

      /*eslint-disable no-underscore-dangle*/
      assert.deepEqual(aModelDetails._data.publishLevels, publishLevels, "Match publishlevels");
      /*eslint-enable no-underscore-dangle*/

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

    it("Should be possible to GET id (calculated)", function(done) {

      var aModelDetails = new ModelDetails();

      // Set an id:
      aModelDetails.$route = {
        params: {
          modelid: 4
        }
      };

      assert.isTrue(aModelDetails.id === aModelDetails.$route.params.modelid, "Match id");

      done();

    });


    it("Should be possible to SET id (calculated)", function(done) {

      var aModelDetails = new ModelDetails();
      var idToSet = 4;

      aModelDetails.id = idToSet;

      // Apperantly, we always use the router for the get function. So we expect -1 right now (no route params)
      assert.isTrue(aModelDetails.id === -1, "Match id");

      done();

    });


    it("Should be possible to GET progress (calculated)", function(done) {

      var aModelDetails = new ModelDetails();
      var progressToSet = 55;

      // Set a fake progress
      aModelDetails.model = { progress: progressToSet };

      // Does the progress match?
      assert.isTrue(aModelDetails.progress === progressToSet, "Match progress");

      done();

    });


    it("Should be possible to GET scenario (calculated after model set)", function(done) {

      var aModelDetails = new ModelDetails();
      var scenarioToSet = 123;

      // Set a fake progress
      aModelDetails.model = { scenario: scenarioToSet };

      // Does the progress match?
      assert.isTrue(aModelDetails.scenario === scenarioToSet, "Match scenario");

      done();

    });


    it("Should be possible to GET current publishlevel - unknown", function(done) {

      var aModelDetails = new ModelDetails();

      var publishLevel = aModelDetails.publishLevel;

      // When nothing is set, should return "unknown"
      assert.isTrue(publishLevel === "Unknown", "Match unknown");

      done();

    });

    it("Should be possible to GET current publishlevel - public", function(done) {

      var aModelDetails = new ModelDetails();

      // We set a share state of a fake model.
      aModelDetails.model = {
        shared: "w" // w means "Public"
      };

      var publishLevel = aModelDetails.publishLevel;

      // We expect public
      assert.isTrue(publishLevel === "Public", "Match wtih public");

      done();

    });

    it("Should be possible to GET next publishlevel", function(done) {

      var aModelDetails = new ModelDetails();

      // We set a share state of a fake model.
      aModelDetails.model = {
        shared: "c" // c means "company"
      };

      // Now we go to the 'next level'
      var publishLevel = aModelDetails.nextPublishLevel;

      // We expect public (private->company->public)
      assert.isTrue(publishLevel === "Public", "Match wtih public");

      done();

    });


    it("Should be possible to REMOVE a model", function(done) {
      var correctReply = false;

      modelDetails = new ModelDetails();

      modelDetails.$parent = {};
      modelDetails.$parent.$broadcast = function() {
      };

      modelDetails.$root = {};
      modelDetails.$root.$broadcast = function() {
      };

      modelDetails.model.id = 4;

      // To get dialogs, manually have to create and add them to the component. So that is what we do here:
      var dialog = new ConfirmDialog();

      dialog.dialogId = "delete";
      modelDetails.$children.push(dialog);

      // End manual dialog.


      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .intercept("/api/v1/scenes/" + modelDetails.model.id + "/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
        .delete("/api/v1/scenes/" + modelDetails.model.id + "/")
        .reply(200, function() {
          correctReply = true;
          return {};
        });

      // Make sure the nock server had the time to reply
      window.setTimeout(function() {
        try {
          assert(correctReply === true, "Nock server did not reach reply");
          done();
        } catch (e) {
          done(e);
        }
      }, 150);


      $("#dialog-container").load("/templates/confirm-dialog.html", function() {

        var deleteDialog = getDialog(modelDetails, "confirm-dialog", "delete");


        modelDetails.removeModel();

        // confirm the dialog:
        deleteDialog.onConfirm();
      });
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



    it("Does ImageAnimation have the initial values", function(done) {

      var defaultData = {
        // Current animation frame:
        currentAnimationIndex: 0,

        // timer id for animation.
        timerAnimation: -1,

        // Which imagelist are we currently watching?
        currentAnimationKey: "delta_fringe_images",

        isAnimating: false
      };

      /*eslint-disable no-underscore-dangle*/
      assert.deepEqual(imageAnimation._data, defaultData, "Match default properties");
      /*eslint-enable no-underscore-dangle*/

      done();

    });


    it("Does ImageAnimation have the right default 'props'", function(done) {


      // Couldn't match on the function, so we only check if model exists.
      assert.isOk(ImageAnimation.options.props.model, "Match default properties");

      done();

    });



    it("Should be possible to stop image frames - no anim key", function(done) {

      // Fake a timer interval:
      imageAnimation.timerAnimation = 0;
      imageAnimation.currentAnimationKey = "";

      assert.isFalse(imageAnimation.stopImageFrame(), "should have bailed out early");


      done();

    });

    it("Should be possible to stop image frames", function(done) {

      // Fake a timer interval:
      imageAnimation.timerAnimation = 2;
      imageAnimation.currentAnimationKey = "delta_fringe_images";
      imageAnimation.stopImageFrame();

      assert.isTrue(imageAnimation.timerAnimation === -1, "timeranimation id should have become -1");

      done();

    });

    it("Should be possible to play image frames the imageFrame", function(done) {

      imageAnimation.playImageFrame();

      assert.isTrue(imageAnimation.timerAnimation !== -1, "timeranimation id should not be -1");

      done();

    });

    it("Should be possible to play image frames the imageFrame - No animationkey set", function(done) {

      imageAnimation.currentAnimationKey = "";

      // Without an animation key, playimage should just return and do nothing.
      imageAnimation.playImageFrame();

      imageAnimation.timerAnimation = -1;

      assert.isTrue(imageAnimation.timerAnimation === -1, "timeranimation id should still be -1");

      done();

    });

    it("Should be possible to change to next imageFrame", function(done) {

      /*eslint-disable camelcase*/
      imageAnimation.model.info = { delta_fringe_images: { images: ["firstframe.jpg", "lastframe.jpg"] } };
      /*eslint-enable camelcase*/

      imageAnimation.currentAnimationIndex = 0;
      imageAnimation.currentAnimationKey = "delta_fringe_images";

      imageAnimation.nextImageFrame();

      // Next frame should have brought to the next frame.
      assert.isTrue(imageAnimation.animationIndex === 1, "Animation frame at 1");

      done();
    });


    it("Should be possible to change to next imageFrame - stop at end", function(done) {

      /*eslint-disable camelcase*/
      imageAnimation.model.info = { delta_fringe_images: { images: ["firstframe.jpg", "lastframe.jpg"] } };
      /*eslint-enable camelcase*/

      imageAnimation.currentAnimationIndex = 0;
      imageAnimation.currentAnimationKey = "delta_fringe_images";

      // Loop some times, we should end at the last image anyway.
      for (var i = 0; i < 10; i++) {
        imageAnimation.nextImageFrame();
      }

      // Next frame should have brought to the next frame.
      assert.isTrue(imageAnimation.animationIndex === imageAnimation.model.info.delta_fringe_images.images.length - 1, "Animation frame at end");

      done();
    });




    it("Should be possible to change to next imageFrame - no model info", function(done) {

      /*eslint-disable camelcase*/
      imageAnimation.model.info = undefined;
      /*eslint-enable camelcase*/

      imageAnimation.currentAnimationIndex = 0;
      imageAnimation.currentAnimationKey = "delta_fringe_images";

      imageAnimation.nextImageFrame();

      // Next frame should still be at 0, as we did not have any model info.
      assert.isTrue(imageAnimation.currentAnimationIndex === 0, "Animation index should stay 0");

      done();
    });

    it("Should be possible to change to next imageFrame - no animationkey", function(done) {

      /*eslint-disable camelcase*/
      imageAnimation.model.info = { delta_fringe_images: { images: ["firstframe.jpg", "lastframe.jpg"] } };
      /*eslint-enable camelcase*/

      imageAnimation.currentAnimationIndex = 0;
      imageAnimation.currentAnimationKey = "";

      imageAnimation.nextImageFrame();

      // Next frame should still be at 0, as we did not have an animation key yet
      assert.isTrue(imageAnimation.currentAnimationIndex === 0, "Animation index should stay 0");

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
      /*eslint-disable camelcase*/
      imageAnimation.model.info = { delta_fringe_images: { images: ["firstframe.jpg", "lastframe.jpg"] } };
      /*eslint-enable camelcase*/

      imageAnimation.currentAnimationKey = "delta_fringe_images";

      assert.isTrue(imageAnimation.hasFrames === true, "Animation does not have frames");
      done();
    });

    it("Should be possible to check animationIndex property", function(done) {

      // We should not have any frames in this animation object, but maybe make sure later on?
      imageAnimation.currentAnimationIndex = 0;
      imageAnimation.currentAnimationKey = "delta_fringe_images";

      assert.isTrue(imageAnimation.animationIndex === 0, "Animation frame at 0");
      done();
    });

    it("Should be possible to check animationFrame property", function(done) {

       /*eslint-disable camelcase*/
      imageAnimation.model.info = { delta_fringe_images: { location: "location/", images: ["firstframe.jpg", "lastframe.jpg"] } };
      /*eslint-enable camelcase*/
      imageAnimation.model.fileurl = "fileurl/";

      var imgurl = imageAnimation.animationFrame;

      assert.isTrue(imgurl === "fileurl/location/firstframe.jpg", "Animation frame file matches expectation");

      done();
    });

    it("Should be possible to check animationFrame property - empty", function(done) {

       /*eslint-disable camelcase*/
      imageAnimation.model.info = { delta_fringe_images: { location: "location/", images: ["firstframe.jpg", "lastframe.jpg"] } };
      /*eslint-enable camelcase*/
      imageAnimation.model.fileurl = "fileurl/";
      imageAnimation.currentAnimationKey = "";

      var imgurl = imageAnimation.animationFrame;

      assert.isTrue(imgurl === "", "Animation frame file matches expectation");

      done();
    });


    it("Should be possible to check frameCount property", function(done) {

      // We should not have any frames in this animation object, but maybe make sure later on?
       /*eslint-disable camelcase*/
      imageAnimation.model.info = { delta_fringe_images: { images: ["firstframe.jpg", "lastframe.jpg"] } };
      /*eslint-enable camelcase*/
      imageAnimation.currentAnimationKey = "delta_fringe_images";
      assert.isTrue(imageAnimation.frameCount === imageAnimation.model.info.delta_fringe_images.images.length, "Animation framecount should not be 0");
      done();
    });

    it("Should be possible to check frameCount property - no data", function(done) {

      // We should not have any frames in this animation object, but maybe make sure later on?
       /*eslint-disable camelcase*/
      imageAnimation.model.info = { };
      /*eslint-enable camelcase*/
      imageAnimation.currentAnimationKey = "delta_fringe_images";
      assert.isTrue(imageAnimation.frameCount === 0, "Animation framecount should not be 0");
      done();
    });


    it("Should be possible to switchAnimation", function(done) {

      // We should not have any frames in this animation object, but maybe make sure later on?
      imageAnimation.switchAnimation("delta_fringe_images");

      done();
    });

    it("Should be possible to previousImageFrame - No model info", function(done) {

      // index should become 0
       /*eslint-disable camelcase*/
      imageAnimation.model.info = { delta_fringe_images: { images: ["firstframe.jpg", "lastframe.jpg"] } };
      imageAnimation.switchAnimation("delta_fringe_images");
      imageAnimation.currentAnimationIndex = 1; // fake an index.

      // now remove data.
      imageAnimation.model.info = undefined;
      /*eslint-enable camelcase*/

      imageAnimation.previousImageFrame();

      // We started at 0, without data, so it should still be 1, as it was left untouched (maybe should become 0 if the model data is gone though)
      assert.isTrue(imageAnimation.animationIndex === 1, "Animation frame should still have been one.");
      done();
    });

    it("Should be possible to previousImageFrame ", function(done) {

      // index should become 0
       /*eslint-disable camelcase*/
      imageAnimation.model.info = { delta_fringe_images: { images: ["firstframe.jpg", "lastframe.jpg"] } };
      /*eslint-enable camelcase*/
      imageAnimation.switchAnimation("delta_fringe_images");
      imageAnimation.animationIndex = 0;
      imageAnimation.previousImageFrame();

      // We started at 0, so we expect image to go to length -1.
      assert.isTrue(imageAnimation.animationIndex === imageAnimation.model.info.delta_fringe_images.images.length - 1, "Animation frame should have wrapped");
      done();
    });

    it("Should be possible to previousImageFrame - no animation key ", function(done) {

      // index should become 0
       /*eslint-disable camelcase*/
      imageAnimation.model.info = { delta_fringe_images: { images: ["firstframe.jpg", "lastframe.jpg"] } };
      /*eslint-enable camelcase*/
      imageAnimation.currentAnimationKey = ""; // No animation key
      imageAnimation.currentAnimationIndex = 1; // fake an index.;
      imageAnimation.previousImageFrame();

      // We started at 0, without data, so it should still be 1, as it was left untouched (maybe should become 0 if the model data is gone though)
      assert.isTrue(imageAnimation.animationIndex === 1, "Animation frame should still have been one.");
      done();
    });


    it("Should be possible to gotoFirstFrame", function(done) {

      // index should become 0
       /*eslint-disable camelcase*/
      imageAnimation.model.info = { delta_fringe_images: { images: ["firstframe.jpg", "lastframe.jpg"] } };
      /*eslint-enable camelcase*/

      imageAnimation.switchAnimation("delta_fringe_images");
      imageAnimation.gotoFirstFrame();

      assert.isTrue(imageAnimation.animationIndex === 0, "Animation frame at 0");
      done();
    });

    it("Should be possible to gotoLastFrame - number wrap", function(done) {

      // index should become 0.. we do not have any images. Maybe test later using an fake array.
       /*eslint-disable camelcase*/
      imageAnimation.model.info = { delta_fringe_images: { images: [] } };
      /*eslint-enable camelcase*/

      imageAnimation.animationIndex = -10;
      imageAnimation.switchAnimation("delta_fringe_images");
      imageAnimation.gotoLastFrame();

      assert.isTrue(imageAnimation.animationIndex === 0, "Animation frame at 0");
      done();
    });

    it("Should be possible to gotoLastFrame", function(done) {

      // index should become 0.. we do not have any images. Maybe test later using an fake array.
       /*eslint-disable camelcase*/
      imageAnimation.model.info = { delta_fringe_images: { images: ["firstframe.jpg", "lastframe.jpg"] } };
      /*eslint-enable camelcase*/

      imageAnimation.switchAnimation("delta_fringe_images");
      imageAnimation.gotoLastFrame();

      assert.isTrue(imageAnimation.animationIndex === imageAnimation.model.info.delta_fringe_images.images.length - 1, "Animation frame at 0");
      done();
    });




  });


  describe("SearchList class", function() {


    it("Should be possible deselect all runs", function(done) {

      // Add an artificial sene with a model in scene_set with id 1.
      var aSearchList = new SearchList();

      aSearchList.models = [];

       /*eslint-disable camelcase*/
      aSearchList.models.push({id: 123, scene_set: [{ id: 1}]});
       /*eslint-enable camelcase*/

      aSearchList.selectedRuns = [1]; // Assume we test #1

      aSearchList.deselectAllRuns();

      assert.isTrue(aSearchList.selectedRuns.length === 0, "selectedRuns are correct.");
      done();
    });


    it("Should be possible select a scenario", function(done) {

      // Add an artificial sene with a model in scene_set with id 1.
      var aSearchList = new SearchList();

      // Add some scenario info:
      $("#scenario-container").html("<div class='scenario' data-scenarioid='354'>");

      // Fake a html event.
      var ev = { target: $(".scenario") };

      aSearchList.scenarioSelect(354, ev);

      assert.isTrue($(".scenario").hasClass("selected") && aSearchList.selectedScenarios[0] === 354, "selectedRuns are correct.");
      done();
    });

    it("Should be possible get selected runs", function(done) {

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

    it("Should be possible get selected runs - none selected", function(done) {

      // Add an artificial sene with a model in scene_set with id 1.
      var aSearchList = new SearchList();

      aSearchList.models = [];

       /*eslint-disable camelcase*/
      aSearchList.models.push({id: 123, scene_set: [{ id: 1}]});
       /*eslint-enable camelcase*/

      aSearchList.selectedRuns = []; // Assume we test #1

      var models = aSearchList.selectedModels;

      assert.isTrue((models.length === 0), "selectedRun is correct.");
      done();
    });

    it("Should be possible get selectedModelid", function(done) {

      var aSearchList = new SearchList();

      // Add an artificial sene with a model in scene_set with id 1.
      aSearchList.selectedResultId = 1;

      assert.isTrue((aSearchList.selectedResultId === aSearchList.selectedModelId), "selectedResultId matches selectedModelid");
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

    it("check properties ", function(done) {

      //var aSearchList = new SearchList();

      // Expected properties that should match with actual properties.
      var expectedProps = {
        "models": {
          type: Array,
          required: true
        },

        "selectedRuns": {
          type: Array,
          required: true
        },

        "selectedScenarios": {
          type: Array,
          required: true
        },

        "openedScenarios": {
          type: Array,
          required: true
        }
      };


      // Without control key we expect only the last item selected.
      assert.deepEqual(SearchList.options.props, expectedProps, "Match default properties");

      done();
    });

    it("Check default data", function(done) {

      var aSearchList = new SearchList();

      var defaultInfo = {
        selectedResultId: -1,
        keyControlPressed: false
      };

      /*eslint-disable no-underscore-dangle*/
      assert.deepEqual(aSearchList._data, defaultInfo, "Match default properties");
      /*eslint-enable no-underscore-dangle*/

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


    it("Should be possible to call getChildByName", function(done) {

      var aSearchColumns = new SearchColumns();

      // Add fake compnent
      var modelDetails = new ModelDetails();

      aSearchColumns.$children.push(modelDetails);

      var component = aSearchColumns.getChildByName("model-details");

      // We expect not null in this case, as the model-details is not loaded.
      assert.isTrue(component !== null);

      done();
    });

    it("Should be possible to call updateCollapsibles", function(done) {

      var aSearchColumns = new SearchColumns();

      // We cannot really test the bootstrap events right now.
      assert.isOk(aSearchColumns.updateCollapsibles, "updateCollapsibles can be called");

      done();
    });

    it("Should be possible to get names of selected models ", function(done) {

      var aSearchColumns = new SearchColumns();

      // Names should be empty right now.
      var names = aSearchColumns.selectedRunNames;

      assert.isTrue(names.length === 0, "textfield is not empty");

      done();
    });


    it("Should be possible to get names of selected models with items selected", function(done) {

      var aSearchColumns = new SearchColumns();

      // Names should be empty right now.
      aSearchColumns.selectedRuns = [1, 2, 3];


      aSearchColumns.models = [];

      /*eslint-disable camelcase*/
      // Add few test items.
      aSearchColumns.models.push({
        id: 100,
        scene_set: [{ id: 1, name: "a"}]
      });

      aSearchColumns.models.push({
        id: 101,
        scene_set: [{ id: 2, name: "b"}]
      });

      aSearchColumns.models.push({
        id: 102,
        scene_set: [{ id: 3, name: "c"}]
      });

      var names = aSearchColumns.selectedRunNames;

       /*eslint-enable camelcase*/

      assert.isTrue(names === "a,b,c", "selectedrunnames match");

      done();
    });

    // Ignores the selectpicker though.
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

      // To test the component in the function, we add it manually.
      var modelDetails = new ModelDetails();

      aSearchColumns.$children.push(modelDetails);


      aSearchColumns.$dispatch("modelsSelected", selected);

      // How to test components?
      //var details = aSearchColumns.getChildByName("model-details");

      done();
    });

  });


  describe("Loading of templates", function() {

    it("Should be possible to load scenariobuilder templates", function(done) {
      var correctReply = false;

      nock("http://0.0.0.0")
        //.log(console.log)
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .get("/api/v1/templates/")
        .reply(200, function() {
          correctReply = true;
          return {};
        });

      global.fetchTemplates();

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


    it("Should be possible to load search templates - with data", function(done) {
      var correctReply = false;

      nock("http://0.0.0.0")
        //.log(console.log)
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .get("/api/v1/searchforms/")
        .reply(200, function() {
          correctReply = true;
          return "[{\"id\":1,\"name\":\"MAIN\",\"sections\":[{\"variables\":[{\"validators\":{},\"type\":\"text\",\"id\":\"name\",\"name\":\"Name\"},{\"disabled\":true,\"type\":\"text\",\"id\":\"engine\",\"name\":\"Model Engine\",\"validators\":{}},{\"disabled\":true,\"type\":\"semver\",\"id\":\"version\",\"name\":\"Version\",\"validators\":{}}],\"name\":\"Scenario\"},{\"variables\":[{\"units\":\"days\",\"type\":\"numeric\",\"id\":\"simstoptime\",\"name\":\"Stop time\",\"validators\":{\"max\":160,\"min\":0}},{\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\",\"validators\":{\"max\":2,\"min\":0.5},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"outputinterval\",\"name\":\"Output timestep\"}],\"name\":\"Parameters\"},{\"variables\":[{\"name\":\"Basin slope\",\"validators\":{\"max\":0.3,\"min\":0.01},\"factor\":true,\"units\":\"deg\",\"type\":\"numeric\",\"id\":\"basinslope\"},{\"name\":\"River width\",\"validators\":{\"max\":1000,\"min\":100},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"riverwidth\"}],\"name\":\"Geometry\"},{\"variables\":[{\"name\":\"River discharge\",\"validators\":{\"max\":2000,\"min\":0},\"factor\":true,\"units\":\"mÂ³/s\",\"type\":\"numeric\",\"id\":\"riverdischarge\"},{\"name\":\"Tidal amplitude\",\"validators\":{\"max\":3,\"min\":0},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"tidalamplitude\"}],\"name\":\"Forces\"},{\"variables\":[{\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\",\"id\":\"composition\",\"validators\":{},\"type\":\"select\",\"options\":[{\"text\":\"coarse-sand\",\"value\":\"coarse-sand\"},{\"text\":\"medium-sand\",\"value\":\"medium-sand\"},{\"text\":\"fine-sand\",\"value\":\"fine-sanday\"},{\"text\":\"coarse-silt\",\"value\":\"coarse-silt\"},{\"text\":\"medium-silt\",\"value\":\"medium-silt\"},{\"text\":\"fine-silt\",\"value\":\"fine-silt\"}],\"name\":\"Sediment classes\"}],\"name\":\"Sediment composition\",\"description\":\"Sediment can consist of a mixture of different classes. Read <a href='more'>more</a> about the sediment composition clasess.\"}],\"templates\":[{\"name\":\"Basin fill\",\"id\":3},{\"name\":\"Basin fill with marine reworking\",\"id\":4}]}]";
        });

      global.fetchSearchTemplates();

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


    it("Should be possible to load search templates - no data", function(done) {
      var correctReply = false;

      nock("http://0.0.0.0")
        //.log(console.log)
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .get("/api/v1/searchforms/")
        .reply(200, function() {
          correctReply = true;
          return "";
        });

      global.fetchSearchTemplates();

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



  });


  describe("UserDetails", function() {

    // Not sure how to do this..
    xit("Should be able to call ready()", function(done) {


      //var userDetails = new UserDetails();
       /*eslint-disable no-underscore-dangle*/
      /*eslint-enable no-underscore-dangle*/
      done();

    });

    it("Should have default information", function(done) {

      var userDetails = new UserDetails();
      var defaultInfo = {
        user: {
          /*eslint-disable camelcase*/
          first_name: "Unknown",
          last_name: "User"
          /*eslint-enable camelcase*/
        }
      };

      /*eslint-disable no-underscore-dangle*/
      assert.deepEqual(userDetails._data, defaultInfo, "Match default properties");
      /*eslint-enable no-underscore-dangle*/
      done();

    });

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


    it("Should be possible to fetch my info - EXPECT INVALID RESPONSE", function(done) {

      // We return an error this time.

      nock("http://0.0.0.0")
        //.log(console.log)
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .get("/api/v1/users/me/")
        .reply(400, function() {

          return {};
        });

      var userDetails = new UserDetails();


      userDetails.fetchUserInfo().catch(function() {
        // We expect an error.
        done();
      });

    });


    it("Should be possible to receive my first and lastname", function(done) {


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
          return reply;
        });

      var userDetails = new UserDetails();

      userDetails.fetchUserInfo().then(function() {

        assert.isTrue((userDetails.user.first_name === reply[0].first_name && userDetails.user.last_name === reply[0].last_name), "First and lastname match");

        done();

      });

    });


    it("Should be possible to call the details computed property", function(done) {

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
          return reply;
        });

      var userDetails = new UserDetails();

      assert.isOk(userDetails, "UserDetails created");

      userDetails.fetchUserInfo().then(function() {

        var details = userDetails.details;
        var match = "id: 500\nusername: foo\nfirst_name: Foo\nlast_name: User\nemail: foo@bar.com\ngroups: 42,500";

        // Check if the user info is set correctly.
        assert.isTrue(details === match, "details match");

        done();
      });




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

