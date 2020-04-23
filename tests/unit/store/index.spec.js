import chai, { assert } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import nock from 'nock'

import sinonChai from 'sinon-chai'
import store from '@/store'

import _ from 'lodash'

// setup chai
chai.use(chaiAsPromised)
chai.use(sinonChai)

var window = document.defaultView
global.window = window
global.store = store

// We use a setInterval mock function, otherwise setIntervals will cause Mocha to never stop!
global.setInterval = () => {
  // args: callback, time
  // "setInterval override " + callback + " time " + time
  return 1
}

describe('Store: Testing data exchange with api', () => {
  describe('If we can query the scenario list', () => {
    // This test is now working using the filteringPath option.
    // When testing get request, this seems to be the solution.
    // it('Should be possible to LIST scenarios', (done) => {
    nock('http://localhost')
      .defaultReplyHeaders({
        'Content-Type': 'application/json'
      })
      .get('/api/v1/scenarios/')
      .query(true)
      .reply(200, {
      })

    store.dispatch('fetchScenarios')
      .then((data) => {
        assert.isOk(data, 'we have some data')
        done()
      })
      .catch((e) => {
        // rethrow error to capture it and avoid time out
        try {
          throw new Error('exception from fetching scenarios' + JSON.stringify(e))
        } catch (exc) {
          done(exc)
        }
      })
  })

  it('Should be possible to LIST scenarios - FAILURE test', (done) => {
    nock('http://localhost')
      .defaultReplyHeaders({
        'Content-Type': 'application/json'
      })
      .get('/api/v1/scenarios/')
      .query(true)
      .reply(400, {
      })

    // We expect an error, so we call done if this happens.
    store.dispatch('fetchScenarios')
      .catch(() => {
      // We expected an error.
        done()
      })
  })

  // Can we remove scenarios?
  it('Should be possible to DELETE scenarios', (done) => {
    var deleteId = 4

    nock('http://localhost')
      .defaultReplyHeaders({
        'Content-Type': 'application/json'
      })
      .delete('/api/v1/scenarios/' + deleteId + '/')
      .reply(200, () => {
        return { 'result': 'ok' }
      })

    store.dispatch('deleteScenario', { id: deleteId })
      .then(data => {
        done()
      })
  })
  it('Should be possible to DELETE scenarios - FAILURE test', (done) => {
    var deleteId = 4

    nock('http://localhost')
      .defaultReplyHeaders({
        'Content-Type': 'application/json'
      })
      .persist()

      .delete('/api/v1/scenarios/' + deleteId + '/')
      .reply(400, {})

    // An error is expected, so we use done() when it happens.
    store.dispatch('deleteScenario', { id: deleteId }).catch(() => {
      // We expected an error.
      done()
    })
  })
  //
  // Test deletescenario when we do not specify any id
  it('Should be possible to DELETE scenarios - no id specified', (done) => {
    // We expect that an error message appears from this call without id
    store.dispatch('deleteScenario').catch((e) => {
      assert.equal(e, 'Error: No scenario id to delete')
      done()
    })
  })

  describe('If we can query the model list', () => {
    // This test is now working using the filteringPath option.
    // When testing get request, this seems to be the solution.
    it('Should be possible list models', (done) => {
      nock('http://localhost')
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get('/api/v1/scenes/')
        .query(true)
        .reply(200, [
          {
            id: 1,
            name: 'Run 1'
          }
        ])

      store.dispatch('fetchModels')
        .then((data) => {
          assert.isOk(data, 'we have some data')
          done()
        })
        .catch((e) => {
          console.log(e)
          // rethrow error to capture it and avoid time out
          try {
            throw e
          } catch (exc) {
            done(exc)
          }
        })
    })

    // This test is now working using the filteringPath option.
    // When testing get request, this seems to be the solution.
    it('If we can query the model list - FAILURE test', (done) => {
      nock('http://localhost')
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get('/api/v1/scenes/')
        .query(true)
        .reply(400, [
          {
            id: 1,
            name: 'Run 1'
          }
        ])

      store.dispatch('fetchModels').catch(() => {
        // We expected an error.
        done()
      })
    })

    it('Should be possible to start and stop sync models', () => {
      store.dispatch('startSync')
      store.dispatch('stopSync')
    })
  })
})

describe('Store: Test model related API calls', () => {
  it('Should be possible to delete a model', (done) => {
    var deleteID = 4

    nock('http://localhost')
      .defaultReplyHeaders({
        'Content-Type': 'application/json'

      })
      .delete('/api/v1/scenes/' + deleteID + '/')
      .reply(200, () => {
        return {}
      })

    store.dispatch('deleteModel', { modelContainer: { id: deleteID } })
      .then(() => {
        done()
      })
      .catch((e) => {
        console.log('Cannot delete model', e)
        done(new Error(e))
      })
  })

  it('Should be possible to reset a model', (done) => {
    var id = 4

    nock('http://localhost')
      .intercept('/api/v1/scenes/' + id + '/reset/', 'OPTIONS')
      .reply(200, () => {
        return 'Allow: GET, HEAD, PUT, DELETE, POST'
      })
      // Browsers (and jquery) expect the Access-Control-Allow-Origin header
      .put('/api/v1/scenes/' + id + '/reset/')
      .reply(200, () => {
        return '{"a":' + id + '}'
      })

    store.dispatch('resetModel', { modelContainer: {
      id: id,
      data: { state: null }
    } })
      .then(() => {
        // doesn't return anything, so nothing to check....
        done()
      })
      .catch((e) => {
        console.log(e)
        done(new Error(e))
      })
  })

  it('Should be possible to start a model', (done) => {
    var id = 4

    nock('http://localhost')
      .intercept('/api/v1/scenes/' + id + '/start/', 'OPTIONS')
      .reply(200, () => {
        return 'Allow: GET, HEAD, PUT, DELETE, POST'
      })
      // Browsers (and jquery) expect the Access-Control-Allow-Origin header
      .put('/api/v1/scenes/' + id + '/start/')
      .reply(200, () => {
        return '{"a":' + id + '}'
      })

    store.dispatch('startModel', {
      id: id,
      data: { state: null }
    })
      .then(() => {
        // doesn't return anything, so nothing to check....
        done()
      })
      .catch((e) => {
        console.log(e)
        done(new Error(e))
      })
  })

  it('Should be possible to stop multiple models (stopSelectedModels) - also stop runs', (done) => {
    // Process these ids
    store.state.modelContainers = [
      { id: 1, selected: true, data: { state: null } },
      { id: 2, selected: true, data: { state: null } }
    ]

    var observedCount = 0
    var expectedCount = store.state.modelContainers.length

    // Mock the three requests:
    nock('http://localhost')
    // .log(console.log)
      .intercept('/api/v1/scenes/' + store.state.modelContainers[0].id + '/stop/', 'OPTIONS')
      .reply(200, () => {
        return 'Allow: GET, HEAD, PUT, DELETE, POST'
      })
      // Browsers (and jquery) expect the Access-Control-Allow-Origin header
      .put('/api/v1/scenes/' + store.state.modelContainers[0].id + '/stop/')
      .reply(200, () => {
        // We got the right reply:
        observedCount++
        return {}
      })
      .intercept('/api/v1/scenes/' + store.state.modelContainers[1].id + '/stop/', 'OPTIONS')
      .reply(200, () => {
        return 'Allow: GET, HEAD, PUT, DELETE, POST'
      })
      // Browsers (and jquery) expect the Access-Control-Allow-Origin header
      .put('/api/v1/scenes/' + store.state.modelContainers[1].id + '/stop/')
      .reply(200, () => {
        // We got the right reply:
        observedCount++
        return {}
      })

    store.dispatch('stopSelectedModels')
      .then(() => {
        assert.equal(expectedCount, observedCount, 'Got all expected replies')
        done()
      })
      .catch((e) => {
        console.log('cannot stop multiple models')
        done(new Error(e))
      })
  })

  it('Should be possible to stop a model', (done) => {
    var correctReply = false
    var id = 4

    // TODO: verification dialog testing
    // To get dialogs, manually have to create and add them to the component. So that is what we do here:
    // var dialog = new ConfirmDialog();
    // dialog.dialogId = "stop";
    // modelDetails.$children.push(dialog);

    nock('http://localhost')
      .intercept('/api/v1/scenes/' + id + '/stop/', 'OPTIONS')
      .reply(200, () => {
        return 'Allow: GET, HEAD, PUT, DELETE, POST'
      })
      .put('/api/v1/scenes/' + id + '/stop/')
      .reply(200, () => {
        correctReply = true
        return {}
      })

    // Make sure the nock server had the time to reply
    window.setTimeout(() => {
      try {
        assert(correctReply === true, 'Nock server did not reach reply')
        done()
      } catch (e) {
        done(e)
      }
    }, 150)

    store.dispatch('stopModel', { id: id, data: { state: '' } })
  })

  it('Should be possible to stop a model - FAILURE test', (done) => {
    var id = 4

    nock('http://localhost')
      // jquery calls OPTIONS first
      .intercept('/api/v1/scenes/' + id + '/stop/', 'OPTIONS')
      .reply(200, () => {
        return 'Allow: GET, HEAD, PUT, DELETE, POST'
      })
      // Browsers (and jquery) expect the Access-Control-Allow-Origin header
      .put('/api/v1/scenes/' + id + '/stop/')
      .reply(400, () => {
        // We got the right reply:
        return {}
      })

    store.dispatch('stopModel', { id: id, data: { state: '' } })
      .then(() => {
        done(new Error('we should get a 400 reply'))
      })
      // this is what we expect
      .catch(() => {
        done()
      })
  })

  it('Should be possible to start a model - FAILURE test', (done) => {
    var id = 4

    nock('http://localhost')
      .intercept('/api/v1/scenes/' + id + '/start/', 'OPTIONS')
      .reply(200, () => {
        return 'Allow: GET, HEAD, PUT, DELETE, POST'
      })
      // Browsers (and jquery) expect the Access-Control-Allow-Origin header
      .put('/api/v1/scenes/' + id + '/start/')
      .reply(400, () => {
        return {}
      })

    store.dispatch('startModel', { id: id, data: { state: '' } }).catch(() => {
      // We expected an error.
      done()
    })
  })
})
