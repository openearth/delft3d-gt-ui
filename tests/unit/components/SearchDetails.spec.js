import chai, { assert } from 'chai'
import { shallowMount } from '@vue/test-utils'
import SearchDetails from '../../../src/components/SearchDetails.vue'
import chaiAsPromised from 'chai-as-promised'

import sinonChai from 'sinon-chai'
import sinon from 'sinon'
import _ from 'lodash'
import nock from 'nock'

_.assign(global, require('../../../src/templates.js'))

// setup chai
chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('SearchDetails.vue', () => {
  it('Is possible to instantiate component SearchDetails', (done) => {
    const searchDetails = shallowMount(SearchDetails)
    searchDetails.search = sinon.stub()
    assert.isOk(searchDetails)
    searchDetails.search.reset()
    done()
  })
})

describe('Search details', () => {
  it('Does Searchdetails have the initial values', (done) => {
    var defaultData = {
      activatedPostProc: {},
      searchTemplate: null,
      createdAfter: '',
      createdBefore: '',
      searchText: '',
      selectedDomains: [],
      selectedOutdated: [],
      selectedParameters: [],
      selectedPostProc: {},
      selectedTemplates: [],
      selectedUsers: [],
      users: []
    }

    /* eslint-disable no-underscore-dangle */
    assert.deepEqual(SearchDetails.data(), defaultData, 'Match default properties')
    /* eslint-enable no-underscore-dangle */

    done()
  })

  it('fetchSearchtemplate', (done) => {
    nock('http://localhost')
      .defaultReplyHeaders({
        'Content-Type': 'application/json'
      })
      .get('/api/v1/searchforms/')
      .query(true)
      .reply(200, {})

    global.fetchSearchTemplate()
      .then((template) => {
        done()
      })
  })

  it('Is possible to get modelEngines', (done) => {
    const searchDetails = shallowMount(SearchDetails)

    searchDetails.vm.templates = [{
      sections: [{
        variables: [{
          id: 'engine',
          default: 'Delft3D'
        }]
      }]
    }]

    assert.deepEqual(searchDetails.vm.modelEngines, ['Delft3D'])
    done()
  })

  it('Is possible to get parameters', (done) => {
    const searchDetails = shallowMount(SearchDetails)

    searchDetails.vm.templates = [{
      sections: [{
        variables: [{
          id: 'riverwidth',
          validators: {
            min: 3,
            max: 10
          }
        }]
      }]
    }]

    var comp = {
      riverwidth: {
        id: 'riverwidth',
        min: 3,
        max: 10
      }
    }

    assert.deepEqual(searchDetails.vm.parameters, comp)
    done()
  })

  it('Is possible to build a request', (done) => {
    const searchDetails = shallowMount(SearchDetails)

    /* eslint-disable camelcase */
    // no values set
    var params = {
      created_after: '',
      created_before: '',
      search: '',
      shared: [],
      template: [],
      users: [],
      parameter: []
    }

    /* eslint-ensable camelcase */

    assert.deepEqual(searchDetails.vm.buildParams(), params)
    done()
  })

  // it("Is possible to start a search", (done) =>  {
  //   const searchDetails = shallowMount(SearchDetails)
  //   var replyCount = 0;
  //
  //   nock('http://localhost')
  //     .defaultReplyHeaders({
  //       'Content-Type': 'application/json'
  //     })
  //     .post('/api/v1/scenes/')
  //     .query(true)
  //     .reply(200, () => {
  //       replyCount++;
  //       return "[{'id':357,'name':'New Delta Plain Scenario','owner_url':'http://localhost:9000/api/v1/users/500/','template':1,'parameters':{'engine':{'values':['Delft3D Curvilinear'],'name':'Model Engine'},'simstoptime':{'units':'days','values':[60],'name':'Stop time'},'clayvolcomposition':{'units':'%','values':[1],'name':'Clay volumetric composition'},'sandvolcomposition':{'units':'%','values':[1],'name':'Sand volumetric composition'},'version':{'values':['v0.1'],'name':'Version'},'riverdischarge':{'units':'m³/s','values':[1000],'name':'River discharge'},'riverwidth':{'units':'m','values':[555],'name':'River width'},'dt':{'units':'min','values':[1],'name':'Timestep'},'tidalamplitude':{'units':'m','values':[1],'name':'Tidal amplitude'},'outputinterval':{'units':'days','values':[1],'name':'Output timestep','description':'Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.'},'basinslope':{'units':'deg','values':[0.0143],'name':'Basin slope'}},'progress':0,'scene_set':[897]}]";
  //     });
  //
  //     nock('http://localhost')
  //       .defaultReplyHeaders({
  //         'Content-Type': 'application/json'
  //       })
  //       .post('/api/v1/scenes/')
  //     .query(true)
  //     .reply(200, () => {
  //       replyCount++;
  //       return "[{'id':897,'name':'New Delta Plain Scenario: Run 1','state':'INACTIVE','progress':0,'owner':{'id':500,'username':'foo','first_name':'Foo','last_name':'User','email':'foo@bar.com','groups':[42,500]},'shared':'p','suid':'cfa3b8a6-87b8-4f3a-b0f8-da7c6dc3468e','scenario':[357],'fileurl':'/files/cfa3b8a6-87b8-4f3a-b0f8-da7c6dc3468e/','info':{'channel_network_images':{'files':[],'location':'process/'},'logfile':{'location':'simulation/','file':''},'delta_fringe_images':{'files':[],'location':'process/'},'procruns':0,'sediment_fraction_images':{'files':[],'location':'process/'}},'parameters':{'engine':{'name':'Model Engine','value':'Delft3D Curvilinear'},'simstoptime':{'units':'days','name':'Stop time','value':60},'clayvolcomposition':{'units':'%','name':'Clay volumetric composition','value':1},'sandvolcomposition':{'units':'%','name':'Sand volumetric composition','value':1},'version':{'name':'Version','value':'v0.1'},'riverdischarge':{'units':'m³/s','name':'River discharge','value':1000},'riverwidth':{'units':'m','name':'River width','value':555},'dt':{'units':'min','name':'Timestep','value':1},'tidalamplitude':{'units':'m','name':'Tidal amplitude','value':1},'outputinterval':{'units':'days','name':'Output timestep','value':1,'description':'Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.'},'basinslope':{'units':'deg','name':'Basin slope','value':0.0143}},'task_id':'afbc3296-1679-450a-8c5e-5b6431c5cf20','workingdir':'/data/container/files/cfa3b8a6-87b8-4f3a-b0f8-da7c6dc3468e/'}]";
  //     });
  //
  //   searchDetails.vm.search();
  //
  //   // we expect two replies.
  //   window.setTimeout(() => {
  //     try {
  //       assert.isTrue(replyCount === 2, "Nock server did not reach replies");
  //       done();
  //     } catch (e) {
  //       done(e);
  //     }
  //   }, 100);
  //
  // });
})
