import chai, { assert } from 'chai'
import { shallowMount } from '@vue/test-utils'
import chaiAsPromised from 'chai-as-promised'
import sinonChai from 'sinon-chai'
import nock from 'nock'

import ScenarioCreate from '../../../src/views/ScenarioCreate'

// TODO: load validationProvider
// setup chai
chai.use(chaiAsPromised)
chai.use(sinonChai)

// We use a setInterval mock function, otherwise setIntervals will cause Mocha to never stop!
global.setInterval = () => {
  // args: callback, time
  // "setInterval override " + callback + " time " + time
  return 1
}

describe('ScenarioCreate - Scenario builder', () => {
  it('Should be possible to convert a single value to a tag array', (done) => {
    const scenarioCreate = shallowMount(ScenarioCreate)

    var array = scenarioCreate.vm.factorToArray({
      factor: true,
      value: 0.3,
      type: 'numeric'
    })

    assert.equal(0.3, array[0])
    done()
  })

  it('Should be possible to convert a comma separated string to a tag array', (done) => {
    const scenarioCreate = shallowMount(ScenarioCreate)

    var array = scenarioCreate.vm.factorToArray({
      factor: true,
      value: '0,2,3',
      type: 'numeric'
    })

    assert.equal(0, array[0])
    done()
  })

  it('Should be possible to check a value using the custom max validator', (done) => {
    // check if we get an invalid error if we pass 0
    var valid = ScenarioCreate.validators.min('0,2,3', 1)

    assert.isFalse(valid)
    done()
  })

  it('Should be possible get the total number of runs', (done) => {
    const scenarioCreate = shallowMount(ScenarioCreate)

    // check if we get an invalid error if we pass 0
    scenarioCreate.vm.scenarioConfig = scenarioCreate.vm.prepareScenarioConfig({
      'sections': [
        {
          'variables': [
            {
              id: 'var1',
              value: '0,3',
              default: '0,3',
              type: 'numeric',
              factor: true
            }
          ]
        }
      ]
    })
    assert.equal(2, scenarioCreate.vm.totalRuns)
    done()
  })

  it('Should be possible to call validform - TRUE', (done) => {
    const scenarioCreate = shallowMount(ScenarioCreate)

    scenarioCreate.vm.$validation = {
      valid: true
    }

    assert.isTrue(scenarioCreate.vm.validForm)

    done()
  })

  it('Should be possible to call validform - FALSE', (done) => {
    const scenarioCreate = shallowMount(ScenarioCreate)

    scenarioCreate.vm.$validation = {
      valid: false
    }

    assert.isFalse(scenarioCreate.vm.validForm)

    done()
  })

  it('Should be possible to prepare a scenario', (done) => {
    const scenarioCreate = shallowMount(ScenarioCreate)

    // empty template
    var template = {}

    scenarioCreate.vm.selectTemplate(template)

    assert.isOk(scenarioCreate.vm.scenarioConfig)

    done()
  })

  it('Should be possible to update with query parameters', (done) => {
    const scenarioCreate = shallowMount(ScenarioCreate)

    scenarioCreate.vm.updateWithQueryParameters()

    assert.isOk(scenarioCreate.vm.scenarioConfig)

    done()
  })

  it('Should be possible to submit a scenario', (done) => {
    const scenarioCreate = shallowMount(ScenarioCreate)

    // Set some vars:
    scenarioCreate.vm.prepareScenarioConfig({
      'sections': [
        {
          'variables': [
            {
              id: 'var1',
              default: 0,
              factor: true
            }
          ]
        }
      ]
    })

    scenarioCreate.vm.submitScenario()

    assert.isOk(scenarioCreate.vm.scenarioConfig)

    done()
  })

  it('Should be possible to call updateAfterTick', (done) => {
    const scenarioCreate = shallowMount(ScenarioCreate)

    assert.isOk(scenarioCreate.vm.updateAfterTick)

    done()
  })

  it('Should be possible to prepare a scenario', (done) => {
    const scenarioCreate = shallowMount(ScenarioCreate)

    scenarioCreate.vm.prepareScenarioConfig({
      'sections': [
        {
          'variables': [
            {
              id: 'var1',
              default: 0,
              factor: true
            }
          ]
        }
      ]
    })

    assert.isOk(scenarioCreate.vm.scenarioConfig)

    done()
  })

  it('Should be possible to use getId ', (done) => {
    const scenarioCreate = shallowMount(ScenarioCreate)

    var variable = {
      id: 'testvar'
    }

    scenarioCreate.vm.scenarioConfig = {
      id: 1
    }

    var result = scenarioCreate.vm.getId(variable)
    var expected = 1 + ',' + variable.id

    assert.isTrue(result === expected, 'getId matches')

    done()
  })

  it('Should be possible to update with query parameters', (done) => {
    const scenarioCreate = shallowMount(ScenarioCreate)

    // fake the router
    ScenarioCreate.$route = {}

    ScenarioCreate.$route.query = {
      name: 'test'
    }

    // encoded in url

    /* eslint-disable quotes */
    ScenarioCreate.$route.query.parameters = '{"engine":{"values":["Delft3D Curvilinear"],"name":"Model Engine"},"simstoptime":{"units":"days","values":[5],"name":"Stop time"},"clayvolcomposition":{"units":"%","values":[50],"name":"Clay volumetric composition"},"riverdischarge":{"units":"m³/s","values":[1000,1200,1400],"name":"River discharge"}}'
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
    scenarioCreate.vm.updateWithQueryParameters()
    assert.isOk(scenarioCreate)
    done()
  })

  // Test if we can fetc htemplates through scenario builder
  // Later on it should maybe really use fake JSON to build scenarios.
  it('Should be possible to fetch templates', (done) => {


    const scenarioCreate = shallowMount(ScenarioCreate)
    var correctReply = false

    nock('http://localhost')
      .get('/api/v1/templates/')
      .reply(200, () => {
        correctReply = true
        return "[{\"id\":50,\"name\":\"Basin fill\",\"meta\":{\"description\":\"A river dominated and tidal influenced delta (no waves). No specific location. This is a delta like the Mississipi delta or the Mahakam river delta on East Kalimantan.\",\"creator\":\"fedor.baart@deltares.nl\"},\"sections\":[{\"variables\":[{\"default\":\"Basin Fill Scenario\",\"type\":\"text\",\"id\":\"name\",\"name\":\"Name\",\"validators\":{\"required\":true}},{\"name\":\"Model Engine\",\"default\":\"Delft3D Curvilinear\",\"disabled\":true,\"validators\":{\"required\":true},\"type\":\"text\",\"id\":\"engine\"},{\"name\":\"Version\",\"default\":\"v0.1\",\"disabled\":true,\"validators\":{\"required\":true},\"type\":\"semver\",\"id\":\"version\"}],\"name\":\"Scenario\"},{\"variables\":[{\"name\":\"Stop time\",\"default\":60,\"validators\":{\"max\":160,\"required\":true,\"min\":0},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"simstoptime\"},{\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\",\"default\":1,\"validators\":{\"max\":2,\"required\":true,\"min\":0.5},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"outputinterval\",\"name\":\"Output timestep\"}],\"name\":\"Parameters\"},{\"variables\":[{\"name\":\"Basin slope\",\"default\":0.0143,\"validators\":{\"max\":0.3,\"required\":true,\"min\":0.01},\"factor\":true,\"units\":\"deg\",\"type\":\"numeric\",\"id\":\"basinslope\"},{\"name\":\"River width\",\"default\":300,\"validators\":{\"max\":1000,\"required\":true,\"min\":100},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"riverwidth\"}],\"name\":\"Geometry\"},{\"variables\":[{\"name\":\"River discharge\",\"default\":1000,\"validators\":{\"max\":2000,\"required\":true,\"min\":0},\"factor\":true,\"units\":\"mÂ³/s\",\"type\":\"numeric\",\"id\":\"riverdischarge\"},{\"name\":\"Tidal amplitude\",\"default\":1,\"validators\":{\"max\":3,\"required\":true,\"min\":0},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"tidalamplitude\"}],\"name\":\"Forces\"},{\"variables\":[{\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\",\"default\":\"medium-sand\",\"id\":\"composition\",\"validators\":{},\"type\":\"select\",\"options\":[{\"text\":\"coarse-sand\",\"value\":\"coarse-sand\"},{\"text\":\"medium-sand\",\"value\":\"medium-sand\"},{\"text\":\"fine-sand\",\"value\":\"fine-sand\"},{\"text\":\"coarse-silt\",\"value\":\"coarse-silt\"},{\"text\":\"medium-silt\",\"value\":\"medium-silt\"},{\"text\":\"fine-silt\",\"value\":\"fine-silt\"}],\"name\":\"Sediment classes\"}],\"name\":\"Sediment composition\",\"description\":\"Sediment can consist of a mixture of different classes. Read <a href='more'>more</a> about the sediment composition clasess.\"}]},{\"id\":51,\"name\":\"Basin fill with marine reworking\",\"meta\":{\"description\":\"A river or tide dominated delta with wind waves as a marine reworking force\",\"creator\":\"liang.li@tudelft.nl\"},\"sections\":[{\"variables\":[{\"default\":\"Basin Fill with Marine Reworking Scenario\",\"type\":\"text\",\"id\":\"name\",\"name\":\"Name\",\"validators\":{\"required\":true}},{\"name\":\"Model Engine\",\"default\":\"Delft3D Curvilinear\",\"disabled\":true,\"validators\":{\"required\":true},\"type\":\"text\",\"id\":\"engine\"},{\"name\":\"Version\",\"default\":\"v0.1\",\"disabled\":true,\"validators\":{\"required\":true},\"type\":\"semver\",\"id\":\"version\"}],\"name\":\"Scenario\"},{\"variables\":[{\"name\":\"Stop time\",\"default\":60,\"validators\":{\"max\":160,\"required\":true,\"min\":0},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"simstoptime\"},{\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\",\"default\":1,\"validators\":{\"max\":2,\"required\":true,\"min\":0.5},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"outputinterval\",\"name\":\"Output timestep\"}],\"name\":\"Parameters\"},{\"variables\":[{\"name\":\"Basin slope\",\"default\":0.0143,\"validators\":{\"max\":0.3,\"required\":true,\"min\":0.01},\"factor\":true,\"units\":\"deg\",\"type\":\"numeric\",\"id\":\"basinslope\"},{\"name\":\"River width\",\"default\":300,\"validators\":{\"max\":1000,\"required\":true,\"min\":100},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"riverwidth\"}],\"name\":\"Geometry\"},{\"variables\":[{\"name\":\"River discharge\",\"default\":1000,\"validators\":{\"max\":2000,\"required\":true,\"min\":0},\"factor\":true,\"units\":\"mÂ³/s\",\"type\":\"numeric\",\"id\":\"riverdischarge\"},{\"name\":\"Tidal amplitude\",\"default\":1,\"validators\":{\"max\":3,\"required\":true,\"min\":0},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"tidalamplitude\"}],\"name\":\"Forces\"},{\"variables\":[{\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\",\"default\":\"medium-sand\",\"id\":\"composition\",\"validators\":{},\"type\":\"select\",\"options\":[{\"text\":\"coarse-sand\",\"value\":\"coarse-sand\"},{\"text\":\"medium-sand\",\"value\":\"medium-sand\"},{\"text\":\"fine-sand\",\"value\":\"fine-sand\"},{\"text\":\"coarse-silt\",\"value\":\"coarse-silt\"},{\"text\":\"medium-silt\",\"value\":\"medium-silt\"},{\"text\":\"fine-silt\",\"value\":\"fine-silt\"}],\"name\":\"Sediment classes\"}],\"name\":\"Sediment composition\",\"description\":\"Sediment can consist of a mixture of different classes. Read <a href='more'>more</a> about the sediment composition clasess.\"}]},{\"id\":52,\"name\":\"Testing template\",\"meta\":{\"description\":\"A river dominated and tidal influenced delta (no waves). No specific location. This is a delta like the Mississipi delta or the Mahakam river delta on East Kalimantan.\",\"creator\":\"fedor.baart@deltares.nl\"},\"sections\":[{\"variables\":[{\"default\":\"Test Basin Fill Scenario\",\"type\":\"text\",\"id\":\"name\",\"name\":\"Name\",\"validators\":{\"required\":true}},{\"name\":\"Timestep\",\"default\":2,\"validators\":{\"max\":20,\"required\":true,\"min\":0.5},\"units\":\"min\",\"type\":\"numeric\",\"id\":\"dt\"},{\"name\":\"Model Engine\",\"default\":\"Delft3D Curvilinear\",\"disabled\":true,\"validators\":{\"required\":true},\"type\":\"text\",\"id\":\"engine\"},{\"name\":\"Version\",\"default\":\"v0.1\",\"disabled\":true,\"validators\":{\"required\":true},\"type\":\"semver\",\"id\":\"version\"}],\"name\":\"Scenario\"},{\"variables\":[{\"name\":\"Stop time\",\"default\":60,\"validators\":{\"max\":160,\"required\":true,\"min\":0},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"simstoptime\"},{\"description\":\"Output can be stored at certain intervals. The output that is written includes the map files (2D, 3D grids), point output and profile output.\",\"default\":1,\"validators\":{\"max\":2,\"required\":true,\"min\":0.5},\"units\":\"days\",\"type\":\"numeric\",\"id\":\"outputinterval\",\"name\":\"Output timestep\"}],\"name\":\"Parameters\"},{\"variables\":[{\"name\":\"Basin slope\",\"default\":0.0143,\"validators\":{\"max\":0.3,\"required\":true,\"min\":0.01},\"factor\":true,\"units\":\"deg\",\"type\":\"numeric\",\"id\":\"basinslope\"},{\"name\":\"River width\",\"default\":300,\"validators\":{\"max\":1000,\"required\":true,\"min\":100},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"riverwidth\"}],\"name\":\"Geometry\"},{\"variables\":[{\"name\":\"River discharge\",\"default\":1000,\"validators\":{\"max\":2000,\"required\":true,\"min\":0},\"factor\":true,\"units\":\"mÂ³/s\",\"type\":\"numeric\",\"id\":\"riverdischarge\"},{\"name\":\"Tidal amplitude\",\"default\":1,\"validators\":{\"max\":3,\"required\":true,\"min\":0},\"factor\":true,\"units\":\"m\",\"type\":\"numeric\",\"id\":\"tidalamplitude\"}],\"name\":\"Forces\"},{\"variables\":[{\"description\":\"Read <a href='more'>more</a> about the sediment composition clasess.\",\"default\":\"medium-sand\",\"id\":\"composition\",\"validators\":{},\"type\":\"select\",\"options\":[{\"text\":\"coarse-sand\",\"value\":\"coarse-sand\"},{\"text\":\"medium-sand\",\"value\":\"medium-sand\"},{\"text\":\"fine-sand\",\"value\":\"fine-sand\"},{\"text\":\"coarse-silt\",\"value\":\"coarse-silt\"},{\"text\":\"medium-silt\",\"value\":\"medium-silt\"},{\"text\":\"fine-silt\",\"value\":\"fine-silt\"}],\"name\":\"Sediment classes\"}],\"name\":\"Sediment composition\",\"description\":\"Sediment can consist of a mixture of different classes. Read <a href='more'>more</a> about the sediment composition clasess.\"}]}]"
      })

    scenarioCreate.vm.fetchTemplateList()

    // Make sure the nock server had the time to reply
    window.setTimeout(() => {
      try {
        assert(correctReply === true, 'Nock server did not reach reply')
        done()
      } catch (e) {
        done(e)
      }
    }, 200)
  })
})
