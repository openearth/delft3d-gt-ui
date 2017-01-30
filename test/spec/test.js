(function() {
  "use strict";

  // We use a setInterval mock function, otherwise setIntervals will cause Mocha to never stop!
  global.setInterval = function() {
    // args: callback, time
    // "setInterval override " + callback + " time " + time
    return 1;
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

  // Load components
  var UserDetails = require("../../app/scripts/components/userdetails.js").UserDetails;

  global.UserDetails = UserDetails;

  var ImageAnimation = require("../../app/scripts/components/imageanimation.js").ImageAnimation;

  global.ImageAnimation = ImageAnimation;

  var ConfirmDialog = require("../../app/scripts/components/confirmdialog.js").ConfirmDialog;

  global.ConfirmDialog = ConfirmDialog;

  var getDialog = require("../../app/scripts/components/confirmdialog.js").getDialog;

  global.getDialog = getDialog;

  var ModelDetails = require("../../app/scripts/components/modeldetails.js").ModelDetails;

  global.ModelDetails = ModelDetails;

  var ScenarioCreate = require("../../app/scripts/components/scenariobuilder.js").ScenarioCreate;

  var SearchDetails = require("../../app/scripts/components/searchdetails.js").SearchDetails;

  global.SearchDetails = SearchDetails;

  var SearchList = require("../../app/scripts/components/searchlist.js").SearchList;

  global.SearchList = SearchList;

  var SearchColumns = require("../../app/scripts/components/searchcolumns.js").SearchColumns;

  // why is this necessary....
  var factorToArray = require("../../app/scripts/components/scenariobuilder.js").factorToArray;


  _.assign(global, require("../../app/scripts/templates.js"));
  _.assign(global, require("../../app/scripts/store.js"));


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
    options.url = "http://0.0.0.0" + (options.url);

  });

  // stuff to test without a browser
  // var sinon = require("sinon");  DISABLED AS TESTS ARE COMMENTED: UNCOMMENT THIS WHEN USED AGAIN
  var nock = require("nock");
  var assert = require("chai").assert;

  describe("Store: Testing data exchange with api", function() {
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

        global.store.fetchScenarios()
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
        global.store.fetchScenarios().catch(function() {
          // We expected an error.
          done();
        });

      });


      // Can we remove scenarios?
      it("Should be possible to DELETE scenarios", function(done) {

        var deleteid = 4;
        var correctReply = false;

        nock("http://0.0.0.0")
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

        global.store.deleteScenario({id: deleteid});

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
        global.store.deleteScenario({id: deleteid}).catch(function() {
          // We expected an error.
          done();
        });

      });


      // Test deletescenario when we do not specify any id
      it("Should be possible to DELETE scenarios - no id specified", function(done) {

        // We expect that an error message appears from this call without id
        global.store.deleteScenario().catch(function(e) {
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

        global.store.fetchModels()
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


        global.store.fetchModels().catch(function() {
          // We expected an error.
          done();
        });

      });




      it("Should be possible to start and stop sync models", function() {

        global.store.startSync();
        assert.isNumber(global.store.interval);
        global.store.stopSync();
        assert.isNull(global.store.interval);
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

        // Fixed properties
        searchText: "",
        // This object will variables received from the templates.
        selectedParameters: { },
        selectedTemplates: [],
        selectedDomains: [],

        createdAfter: "",
        createdBefore: "",
        startedAfter: "",
        startedBefore: "",

        activatedPostProc: {},
        selectedPostProc: {},

        users: [],
        selectedUsers: [],

        selectedVersions: {},

        // Template used for searching (probably always one)
        searchTemplate: null,

        versions: {}
      };

      /*eslint-disable no-underscore-dangle*/
      assert.deepEqual(searchDetails._data, defaultData, "Match default properties");
      /*eslint-enable no-underscore-dangle*/

      done();

    });

    it("fetchSearchtemplate", function(done) {


      nock("http://0.0.0.0")
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .get("/api/v1/searchforms/")
        .reply(200, function() {

          return "[{\"id\":1,\"name\":\"MAIN\",\"sections\":[{\"variables\":[{\"validators\":{},\"type\":\"text\",\"id\":\"name\",\"name\":\"Name\"},{\"disabled\":true,\"type\":\"text\",\"id\":\"engine\",\"name\":\"Model Engine\",\"validators\":{}},{\"disabled\":true,\"type\":\"semver\",\"id\":\"version\",\"name\":\"Version\",\"validators\":{}}],\"name\":\"Scenario\"},{\"variables\":[{\"units\":\"days\",\"type\":\"numeric\",\"id\":\"simstoptime\",\"name\":\"Stop time\",\"validators\":{\"max\":160,\"min\":0}},{\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\",\"validators\":{\"max\":2,\"min\":0.5},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"outputinterval\",\"name\":\"Output timestep\"}],\"name\":\"Parameters\"},{\"variables\":[{\"name\":\"Basin slope\",\"validators\":{\"max\":0.3,\"min\":0.01},\"factor\":true,\"units\":\"deg\",\"type\":\"numeric\",\"id\":\"basinslope\"},{\"name\":\"River width\",\"validators\":{\"max\":1000,\"min\":100},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"riverwidth\"}],\"name\":\"Geometry\"},{\"variables\":[{\"name\":\"River discharge\",\"validators\":{\"max\":2000,\"min\":0},\"factor\":true,\"units\":\"mÂ³/s\",\"type\":\"numeric\",\"id\":\"riverdischarge\"},{\"name\":\"Tidal amplitude\",\"validators\":{\"max\":3,\"min\":0},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"tidalamplitude\"}],\"name\":\"Forces\"},{\"variables\":[{\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\",\"id\":\"composition\",\"validators\":{},\"type\":\"select\",\"options\":[{\"text\":\"coarse-sand\",\"value\":\"coarse-sand\"},{\"text\":\"medium-sand\",\"value\":\"medium-sand\"},{\"text\":\"fine-sand\",\"value\":\"fine-sand\"},{\"text\":\"coarse-silt\",\"value\":\"coarse-silt\"},{\"text\":\"medium-silt\",\"value\":\"medium-silt\"},{\"text\":\"fine-silt\",\"value\":\"fine-silt\"}],\"name\":\"Sediment classes\"}],\"name\":\"Sediment composition\",\"description\":\"Sediment can consist of a mixture of different classes. Read <a href='more'>more</a> about the sediment composition clasess.\"}],\"templates\":[{\"name\":\"Basin fill\",\"id\":3},{\"name\":\"Basin fill with marine reworking\",\"id\":4}]}]";
        });

      global.fetchSearchTemplate()
        .then(function(template) {
          assert.equal(template.id, 1, "Did not get the expected template");
          done();
        });


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

      /*eslint-disable camelcase*/
      // no values set
      var params = {
        created_after: "",
        created_before: "",
        search: "",
        shared: [],
        started_after: "",
        started_before: "",
        template: [],
        users: [],
        parameter: [],
        versions: "{}"
      };

      /*eslint-ensable camelcase*/

      assert.deepEqual(searchDetails.buildParams(), params);
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
        .query({"search": "", "created_after": "", "created_before": "", "started_after": "", "started_before": "", "versions": "{}"})
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
        .query({"search": "", "created_after": "", "created_before": "", "started_after": "", "started_before": "", "versions": "{}"})
        .reply(200, function() {
          replyCount++;
          return "[{'id':897,'name':'New Delta Plain Scenario: Run 1','state':'INACTIVE','progress':0,'owner':{'id':500,'username':'foo','first_name':'Foo','last_name':'User','email':'foo@bar.com','groups':[42,500]},'shared':'p','suid':'cfa3b8a6-87b8-4f3a-b0f8-da7c6dc3468e','scenario':[357],'fileurl':'/files/cfa3b8a6-87b8-4f3a-b0f8-da7c6dc3468e/','info':{'channel_network_images':{'images':[],'location':'process/'},'logfile':{'location':'simulation/','file':''},'delta_fringe_images':{'images':[],'location':'process/'},'procruns':0,'sediment_fraction_images':{'images':[],'location':'process/'}},'parameters':{'engine':{'name':'Model Engine','value':'Delft3D Curvilinear'},'simstoptime':{'units':'days','name':'Stop time','value':60},'clayvolcomposition':{'units':'%','name':'Clay volumetric composition','value':1},'sandvolcomposition':{'units':'%','name':'Sand volumetric composition','value':1},'version':{'name':'Version','value':'v0.1'},'riverdischarge':{'units':'m³/s','name':'River discharge','value':1000},'riverwidth':{'units':'m','name':'River width','value':555},'dt':{'units':'min','name':'Timestep','value':1},'tidalamplitude':{'units':'m','name':'Tidal amplitude','value':1},'outputinterval':{'units':'days','name':'Output timestep','value':1,'description':'Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.'},'basinslope':{'units':'deg','name':'Basin slope','value':0.0143}},'task_id':'afbc3296-1679-450a-8c5e-5b6431c5cf20','workingdir':'/data/container/files/cfa3b8a6-87b8-4f3a-b0f8-da7c6dc3468e/'}]";
        });

      searchDetails.search();

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
          return "[{\"id\":50,\"name\":\"Basin fill\",\"meta\":{\"description\":\"A river dominated and tidal influenced delta (no waves). No specific location. This is a delta like the Mississipi delta or the Mahakam river delta on East Kalimantan.\",\"creator\":\"fedor.baart@deltares.nl\"},\"sections\":[{\"variables\":[{\"default\":\"Basin Fill Scenario\",\"type\":\"text\",\"id\":\"name\",\"name\":\"Name\",\"validators\":{\"required\":true}},{\"name\":\"Model Engine\",\"default\":\"Delft3D Curvilinear\",\"disabled\":true,\"validators\":{\"required\":true},\"type\":\"text\",\"id\":\"engine\"},{\"name\":\"Version\",\"default\":\"v0.1\",\"disabled\":true,\"validators\":{\"required\":true},\"type\":\"semver\",\"id\":\"version\"}],\"name\":\"Scenario\"},{\"variables\":[{\"name\":\"Stop time\",\"default\":60,\"validators\":{\"max\":160,\"required\":true,\"min\":0},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"simstoptime\"},{\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\",\"default\":1,\"validators\":{\"max\":2,\"required\":true,\"min\":0.5},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"outputinterval\",\"name\":\"Output timestep\"}],\"name\":\"Parameters\"},{\"variables\":[{\"name\":\"Basin slope\",\"default\":0.0143,\"validators\":{\"max\":0.3,\"required\":true,\"min\":0.01},\"factor\":true,\"units\":\"deg\",\"type\":\"numeric\",\"id\":\"basinslope\"},{\"name\":\"River width\",\"default\":300,\"validators\":{\"max\":1000,\"required\":true,\"min\":100},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"riverwidth\"}],\"name\":\"Geometry\"},{\"variables\":[{\"name\":\"River discharge\",\"default\":1000,\"validators\":{\"max\":2000,\"required\":true,\"min\":0},\"factor\":true,\"units\":\"mÂ³/s\",\"type\":\"numeric\",\"id\":\"riverdischarge\"},{\"name\":\"Tidal amplitude\",\"default\":1,\"validators\":{\"max\":3,\"required\":true,\"min\":0},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"tidalamplitude\"}],\"name\":\"Forces\"},{\"variables\":[{\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\",\"default\":\"medium-sand\",\"id\":\"composition\",\"validators\":{},\"type\":\"select\",\"options\":[{\"text\":\"coarse-sand\",\"value\":\"coarse-sand\"},{\"text\":\"medium-sand\",\"value\":\"medium-sand\"},{\"text\":\"fine-sand\",\"value\":\"fine-sand\"},{\"text\":\"coarse-silt\",\"value\":\"coarse-silt\"},{\"text\":\"medium-silt\",\"value\":\"medium-silt\"},{\"text\":\"fine-silt\",\"value\":\"fine-silt\"}],\"name\":\"Sediment classes\"}],\"name\":\"Sediment composition\",\"description\":\"Sediment can consist of a mixture of different classes. Read <a href='more'>more</a> about the sediment composition clasess.\"}]},{\"id\":51,\"name\":\"Basin fill with marine reworking\",\"meta\":{\"description\":\"A river or tide dominated delta with wind waves as a marine reworking force\",\"creator\":\"liang.li@tudelft.nl\"},\"sections\":[{\"variables\":[{\"default\":\"Basin Fill with Marine Reworking Scenario\",\"type\":\"text\",\"id\":\"name\",\"name\":\"Name\",\"validators\":{\"required\":true}},{\"name\":\"Model Engine\",\"default\":\"Delft3D Curvilinear\",\"disabled\":true,\"validators\":{\"required\":true},\"type\":\"text\",\"id\":\"engine\"},{\"name\":\"Version\",\"default\":\"v0.1\",\"disabled\":true,\"validators\":{\"required\":true},\"type\":\"semver\",\"id\":\"version\"}],\"name\":\"Scenario\"},{\"variables\":[{\"name\":\"Stop time\",\"default\":60,\"validators\":{\"max\":160,\"required\":true,\"min\":0},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"simstoptime\"},{\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\",\"default\":1,\"validators\":{\"max\":2,\"required\":true,\"min\":0.5},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"outputinterval\",\"name\":\"Output timestep\"}],\"name\":\"Parameters\"},{\"variables\":[{\"name\":\"Basin slope\",\"default\":0.0143,\"validators\":{\"max\":0.3,\"required\":true,\"min\":0.01},\"factor\":true,\"units\":\"deg\",\"type\":\"numeric\",\"id\":\"basinslope\"},{\"name\":\"River width\",\"default\":300,\"validators\":{\"max\":1000,\"required\":true,\"min\":100},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"riverwidth\"}],\"name\":\"Geometry\"},{\"variables\":[{\"name\":\"River discharge\",\"default\":1000,\"validators\":{\"max\":2000,\"required\":true,\"min\":0},\"factor\":true,\"units\":\"mÂ³/s\",\"type\":\"numeric\",\"id\":\"riverdischarge\"},{\"name\":\"Tidal amplitude\",\"default\":1,\"validators\":{\"max\":3,\"required\":true,\"min\":0},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"tidalamplitude\"}],\"name\":\"Forces\"},{\"variables\":[{\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\",\"default\":\"medium-sand\",\"id\":\"composition\",\"validators\":{},\"type\":\"select\",\"options\":[{\"text\":\"coarse-sand\",\"value\":\"coarse-sand\"},{\"text\":\"medium-sand\",\"value\":\"medium-sand\"},{\"text\":\"fine-sand\",\"value\":\"fine-sand\"},{\"text\":\"coarse-silt\",\"value\":\"coarse-silt\"},{\"text\":\"medium-silt\",\"value\":\"medium-silt\"},{\"text\":\"fine-silt\",\"value\":\"fine-silt\"}],\"name\":\"Sediment classes\"}],\"name\":\"Sediment composition\",\"description\":\"Sediment can consist of a mixture of different classes. Read <a href='more'>more</a> about the sediment composition clasess.\"}]},{\"id\":52,\"name\":\"Testing template\",\"meta\":{\"description\":\"A river dominated and tidal influenced delta (no waves). No specific location. This is a delta like the Mississipi delta or the Mahakam river delta on East Kalimantan.\",\"creator\":\"fedor.baart@deltares.nl\"},\"sections\":[{\"variables\":[{\"default\":\"Test Basin Fill Scenario\",\"type\":\"text\",\"id\":\"name\",\"name\":\"Name\",\"validators\":{\"required\":true}},{\"name\":\"Timestep\",\"default\":2,\"validators\":{\"max\":20,\"required\":true,\"min\":0.5},\"units\":\"min\",\"type\":\"numeric\",\"id\":\"dt\"},{\"name\":\"Model Engine\",\"default\":\"Delft3D Curvilinear\",\"disabled\":true,\"validators\":{\"required\":true},\"type\":\"text\",\"id\":\"engine\"},{\"name\":\"Version\",\"default\":\"v0.1\",\"disabled\":true,\"validators\":{\"required\":true},\"type\":\"semver\",\"id\":\"version\"}],\"name\":\"Scenario\"},{\"variables\":[{\"name\":\"Stop time\",\"default\":60,\"validators\":{\"max\":160,\"required\":true,\"min\":0},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"simstoptime\"},{\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\",\"default\":1,\"validators\":{\"max\":2,\"required\":true,\"min\":0.5},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"outputinterval\",\"name\":\"Output timestep\"}],\"name\":\"Parameters\"},{\"variables\":[{\"name\":\"Basin slope\",\"default\":0.0143,\"validators\":{\"max\":0.3,\"required\":true,\"min\":0.01},\"factor\":true,\"units\":\"deg\",\"type\":\"numeric\",\"id\":\"basinslope\"},{\"name\":\"River width\",\"default\":300,\"validators\":{\"max\":1000,\"required\":true,\"min\":100},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"riverwidth\"}],\"name\":\"Geometry\"},{\"variables\":[{\"name\":\"River discharge\",\"default\":1000,\"validators\":{\"max\":2000,\"required\":true,\"min\":0},\"factor\":true,\"units\":\"mÂ³/s\",\"type\":\"numeric\",\"id\":\"riverdischarge\"},{\"name\":\"Tidal amplitude\",\"default\":1,\"validators\":{\"max\":3,\"required\":true,\"min\":0},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"tidalamplitude\"}],\"name\":\"Forces\"},{\"variables\":[{\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\",\"default\":\"medium-sand\",\"id\":\"composition\",\"validators\":{},\"type\":\"select\",\"options\":[{\"text\":\"coarse-sand\",\"value\":\"coarse-sand\"},{\"text\":\"medium-sand\",\"value\":\"medium-sand\"},{\"text\":\"fine-sand\",\"value\":\"fine-sand\"},{\"text\":\"coarse-silt\",\"value\":\"coarse-silt\"},{\"text\":\"medium-silt\",\"value\":\"medium-silt\"},{\"text\":\"fine-silt\",\"value\":\"fine-silt\"}],\"name\":\"Sediment classes\"}],\"name\":\"Sediment composition\",\"description\":\"Sediment can consist of a mixture of different classes. Read <a href='more'>more</a> about the sediment composition clasess.\"}]}]";
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


  describe("Store: Test model related API calls", function() {

    it("Should be possible to delete a model", function(done) {

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
          return {};
        });

      global.store.deleteModel({id: deleteID})
        .then(function() {
          done();
        })
        .catch(function(e) {
          console.log("Cannot delete model", e);
          done(new Error(e));
        });

    });


    it("Should be possible to reset a model", function(done) {
      var id = 4;

      nock("http://0.0.0.0")
        .intercept("/api/v1/scenes/" + id + "/reset/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
      // Browsers (and jquery) expect the Access-Control-Allow-Origin header
        .defaultReplyHeaders({"Access-Control-Allow-Origin": "*"})
        .put("/api/v1/scenes/" + id + "/reset/")
        .reply(200, function() {
          return "{\"a\":" + id + "}";
        });

      global.store.resetModel({
        id: id,
        data: {state: null}
      })
        .then(function() {
          // doesn't return anything, so nothing to check....
          done();
        })
        .catch(function(e) {
          console.log(e);
          done(new Error(e));
        });
    });


    it("Should be possible to start a model", function(done) {
      var id = 4;

      nock("http://0.0.0.0")
        .intercept("/api/v1/scenes/" + id + "/start/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
      // Browsers (and jquery) expect the Access-Control-Allow-Origin header
        .defaultReplyHeaders({"Access-Control-Allow-Origin": "*"})
        .put("/api/v1/scenes/" + id + "/start/")
        .reply(200, function() {
          return "{\"a\":" + id + "}";
        });

      global.store.startModel({
        id: id,
        data: {state: null}
      })
        .then(function() {
          // doesn't return anything, so nothing to check....
          done();
        })
        .catch(function(e) {
          console.log(e);
          done(new Error(e));
        });
    });



    it("Should be possible to stop multiple models (stopSelectedModels) - also stop runs", function(done) {

      // Process these ids
      global.store.state.modelContainers = [
        {id: 1, selected: true, data: {state: null}},
        {id: 2, selected: true, data: {state: null}}
      ];

      var observedCount = 0;
      var expectedCount = global.store.state.modelContainers.length;

      // Mock the three requests:
      nock("http://0.0.0.0")
        // .log(console.log)
        .intercept("/api/v1/scenes/" + global.store.state.modelContainers[0].id + "/stop/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
      // Browsers (and jquery) expect the Access-Control-Allow-Origin header
        .defaultReplyHeaders({"Access-Control-Allow-Origin": "*"})
        .put("/api/v1/scenes/" + global.store.state.modelContainers[0].id + "/stop/")
        .reply(200, function() {

          // We got the right reply:
          observedCount++;
          return {};
        })
        .intercept("/api/v1/scenes/" + global.store.state.modelContainers[1].id + "/stop/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
      // Browsers (and jquery) expect the Access-Control-Allow-Origin header
        .defaultReplyHeaders({"Access-Control-Allow-Origin": "*"})
        .put("/api/v1/scenes/" + global.store.state.modelContainers[1].id + "/stop/")
        .reply(200, function() {

          // We got the right reply:
          observedCount++;
          return {};
        });

      global.store.stopSelectedModels()
        .then(function() {
          assert.equal(expectedCount, observedCount, "Got all expected replies");
          done();
        })
        .catch(function(e) {
          console.log("cannot stop multiple models");
          done(new Error(e));
        });

    });


    it("Should be possible to stop a model", function(done) {
      var correctReply = false;
      var id = 4;

      // TODO: verification dialog testing
      // To get dialogs, manually have to create and add them to the component. So that is what we do here:
      // var dialog = new ConfirmDialog();
      // dialog.dialogId = "stop";
      // modelDetails.$children.push(dialog);

      nock("http://0.0.0.0")
        .intercept("/api/v1/scenes/" + id + "/stop/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
        .defaultReplyHeaders({"Access-Control-Allow-Origin": "*"})
        .put("/api/v1/scenes/" + id + "/stop/")
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

      global.store.stopModel({id: id, data: {state: ""}});

    });


    it("Should be possible to stop a model - FAILURE test", function(done) {
      var id = 4;

      nock("http://0.0.0.0")
      // jquery calls OPTIONS first
        .intercept("/api/v1/scenes/" + id + "/stop/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
      // Browsers (and jquery) expect the Access-Control-Allow-Origin header
        .defaultReplyHeaders({"Access-Control-Allow-Origin": "*"})
        .put("/api/v1/scenes/" + id + "/stop/")
        .reply(400, function() {

          // We got the right reply:
          return {};
        });

      global.store.stopModel({id: id, data: {state: ""}})
        .then(function() {
          done(new Error("we should get a 400 reply"));
        })
      // this is what we expect
        .catch(function() {
          done();
        });

    });

    it("Should be possible to start a model - FAILURE test", function(done) {
      var id = 4;

      nock("http://0.0.0.0")
        .intercept("/api/v1/scenes/" + id + "/start/", "OPTIONS")
        .reply(200, function() {
          return "Allow: GET, HEAD, PUT, DELETE, POST";
        })
      // Browsers (and jquery) expect the Access-Control-Allow-Origin header
        .defaultReplyHeaders({"Access-Control-Allow-Origin": "*"})
        .put("/api/v1/scenes/" + id + "/start/")
        .reply(400, function() {
          return {};
        });

      global.store.startModel({id: id, data: {state: ""}}).catch(function() {
        // We expected an error.
        done();
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
    imageAnimation.model = {
      info: {}
    };



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

      // restore model info
      imageAnimation.model.info = {};
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

      assert.equal("fileurl/location/firstframe.jpg", imgurl, "Animation frame file matches expectation");

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
      // TODO: 0,1? I don't get it....
      assert.equal(imageAnimation.animationIndex, 1, "Animation frame should still have been one.");
      done();
    });

    it("Should not be possible to previousImageFrame before 0", function(done) {

      // index should become 0
      /*eslint-disable camelcase*/
      imageAnimation.model.info = { delta_fringe_images: { images: ["firstframe.jpg", "middleframe.jpg", "lastframe.jpg"] } };
      /*eslint-enable camelcase*/
      imageAnimation.switchAnimation("delta_fringe_images");
      imageAnimation.animationIndex = 0;
      imageAnimation.previousImageFrame();

      // We started at 0, we don't wrap past 0
      assert.equal(imageAnimation.animationIndex, 0, "Animation frame should not have wrapped");
      done();
    });

    // xit
    it("Should be possible to previousImageFrame - no animation key ", function(done) {

      // index should become 0
      /*eslint-disable camelcase*/
      imageAnimation.model.info = { delta_fringe_images: { images: ["firstframe.jpg", "lastframe.jpg"] } };
      /*eslint-enable camelcase*/
      imageAnimation.currentAnimationKey = ""; // No animation key
      imageAnimation.currentAnimationIndex = 1; // fake an index.;
      imageAnimation.previousImageFrame();

      // We started at 0, without data, so it should still be 1, as it was left untouched (maybe should become 0 if the model data is gone though)
      assert.equal(imageAnimation.animationIndex, 1, "Animation frame should still have been one.");
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

    // xit
    it("Should be possible to gotoLastFrame - number wrap", function(done) {

      // index should become 0.. we do not have any images. Maybe test later using an fake array.
      /*eslint-disable camelcase*/
      imageAnimation.model.info = { delta_fringe_images: { images: [] } };
      /*eslint-enable camelcase*/

      imageAnimation.animationIndex = -10;
      imageAnimation.switchAnimation("delta_fringe_images");
      imageAnimation.gotoLastFrame();

      assert.equal(imageAnimation.animationIndex, 0, "Animation frame at 0");
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

      aSearchList.items = [];

      var scenario = {
        id: 123,
        active: true
      };

      aSearchList.items.push(scenario);

      // Assume we test #1
      scenario.active = false;

      assert.equal(aSearchList.selectedItems.length, 0, "selected items are empty");
      done();
    });


    it("Should be possible select a scenario", function(done) {

      // Add an artificial sene with a model in scene_set with id 1.
      var aSearchList = new SearchList();

      var scenario = {
        id: 123,
        active: false
      };

      aSearchList.items = [scenario];
      aSearchList.toggleActive(scenario);
      assert.equal(aSearchList.selectedItems.length, 1, "selected items equal to 1");
      done();
    });

    it("Should be possible get selected runs", function(done) {

      // Add an artificial sene with a model in scene_set with id 1.
      var aSearchList = new SearchList();

      aSearchList.items = [];

      /*eslint-disable camelcase*/
      var scenario = {id: 123, active: true, scene_set: [{ id: 1}]};

      aSearchList.items.push(scenario);
      /*eslint-enable camelcase*/


      assert.equal([scenario].length, aSearchList.selectedItems.length, "selected models is correct.");
      done();
    });

    it("Should be possible get selected runs - none selected", function(done) {

      // Add an artificial sene with a model in scene_set with id 1.
      var aSearchList = new SearchList();

      aSearchList.items = [];

      /*eslint-disable camelcase*/
      aSearchList.items.push({id: 123, active: false, type: "model"});
      /*eslint-enable camelcase*/

      var models = _.filter(aSearchList.selectedItems, ["type", "model"]);

      assert.isTrue((models.length === 0), "selected items is correct.");
      done();
    });


    it("check properties ", function(done) {

      //var aSearchList = new SearchList();

      // Expected properties that should match with actual properties.
      var expectedProps = {
        "items": {
          type: Array,
          required: true
        },
        "models": {
          type: Array,
          required: true
        }
      };


      // Without control key we expect only the last item selected.
      assert.deepEqual(SearchList.options.props, expectedProps, "Match default properties");

      done();
    });

  });






  describe("SearchColumns class", function() {


    it("Should be possible to init SearchColumns", function(done) {

      var aSearchColumns = new SearchColumns();

      // Check default values:
      assert.isTrue(aSearchColumns.items.length === 0, "models matches");


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
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .get("/api/v1/searchforms/")
        .reply(200, function() {
          correctReply = true;
          return "[{\"id\":1,\"name\":\"MAIN\",\"sections\":[{\"variables\":[{\"validators\":{},\"type\":\"text\",\"id\":\"name\",\"name\":\"Name\"},{\"disabled\":true,\"type\":\"text\",\"id\":\"engine\",\"name\":\"Model Engine\",\"validators\":{}},{\"disabled\":true,\"type\":\"semver\",\"id\":\"version\",\"name\":\"Version\",\"validators\":{}}],\"name\":\"Scenario\"},{\"variables\":[{\"units\":\"days\",\"type\":\"numeric\",\"id\":\"simstoptime\",\"name\":\"Stop time\",\"validators\":{\"max\":160,\"min\":0}},{\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\",\"validators\":{\"max\":2,\"min\":0.5},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"outputinterval\",\"name\":\"Output timestep\"}],\"name\":\"Parameters\"},{\"variables\":[{\"name\":\"Basin slope\",\"validators\":{\"max\":0.3,\"min\":0.01},\"factor\":true,\"units\":\"deg\",\"type\":\"numeric\",\"id\":\"basinslope\"},{\"name\":\"River width\",\"validators\":{\"max\":1000,\"min\":100},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"riverwidth\"}],\"name\":\"Geometry\"},{\"variables\":[{\"name\":\"River discharge\",\"validators\":{\"max\":2000,\"min\":0},\"factor\":true,\"units\":\"mÂ³/s\",\"type\":\"numeric\",\"id\":\"riverdischarge\"},{\"name\":\"Tidal amplitude\",\"validators\":{\"max\":3,\"min\":0},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"tidalamplitude\"}],\"name\":\"Forces\"},{\"variables\":[{\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\",\"id\":\"composition\",\"validators\":{},\"type\":\"select\",\"options\":[{\"text\":\"coarse-sand\",\"value\":\"coarse-sand\"},{\"text\":\"medium-sand\",\"value\":\"medium-sand\"},{\"text\":\"fine-sand\",\"value\":\"fine-sand\"},{\"text\":\"coarse-silt\",\"value\":\"coarse-silt\"},{\"text\":\"medium-silt\",\"value\":\"medium-silt\"},{\"text\":\"fine-silt\",\"value\":\"fine-silt\"}],\"name\":\"Sediment classes\"}],\"name\":\"Sediment composition\",\"description\":\"Sediment can consist of a mixture of different classes. Read <a href='more'>more</a> about the sediment composition clasess.\"}],\"templates\":[{\"name\":\"Basin fill\",\"id\":3},{\"name\":\"Basin fill with marine reworking\",\"id\":4}]}]";
        });

      global.fetchSearchTemplate();

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
        .defaultReplyHeaders({
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        })
        .get("/api/v1/searchforms/")
        .reply(200, function() {
          correctReply = true;
          return "";
        });

      global.fetchSearchTemplate();

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


  describe("Store: get user details", function() {

    it("Should have default information", function(done) {

      var defaultInfo = {
        /*eslint-disable camelcase*/
        first_name: "Anonymous",
        id: -1,
        last_name: "User"
        /*eslint-enable camelcase*/
      };

      /*eslint-disable no-underscore-dangle*/
      assert.deepEqual(global.store.state.user, defaultInfo, "Match default properties");
      /*eslint-enable no-underscore-dangle*/
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
