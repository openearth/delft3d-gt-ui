import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import chai, {
  expect
} from 'chai'
import store from '../../../src/store'
import $ from 'jquery'

// setup chai
chai.use(chaiAsPromised)
chai.use(sinonChai)
// let should = chai.should()

// Get the corresponding window
const window = document.defaultView

window.open = sinon.stub()

// test component
describe('Store', () => {
  // beforeEach(() => {
  // // import component
  //   sinon.spy($, 'ajax')
  //   sinon.spy(Promise, 'all')
  //   sinon.spy(Promise, 'reject')
  //   sinon.spy(Promise, 'resolve')
  //   sinon.spy(store, 'dispatch')
  // })

  // afterEach(() => {
  // // Unwrap spies
  //   // $.ajax.restore()
  //   Promise.all.restore()
  //   Promise.reject.restore()
  //   Promise.resolve.restore()
  //   store.dispatch.restore()
  //   store.state.modelContainers = []
  // })
  // ***************************************************************************** update()
  //
  describe('.updateParams()', () => {
    it('updates the parameters', () => {
      // can I call update method
      store.dispatch('updateParams', {
        key: 'val'
      })
      expect(store.state.params).to.have.property('key')
    })
  })
  // ***************************************************************************** updateModelContainers()

  describe('.updateModelContainers()', () => {
    it('updates properly', () => {
      // make sure there are no model containers
      store.state.modelContainers = []
      store.dispatch('updateModelContainers')
      expect(store.state.modelContainers.length).to.equal(0)

      // change models and call update
      store.state.models = [{ id: 'a' }]
      store.dispatch('updateModelContainers')
      //
      // check if store created modelcontainers
      expect(store.state.modelContainers.length).to.equal(1)

      // change models and call update
      store.state.models = [{ id: 'a' }, { id: 'b' }]
      store.state.activeModelContainer = store.state.modelContainers[0]
      store.dispatch('updateModelContainers')

      // check if store created modelcontainers
      expect(store.state.modelContainers.length).to.equal(2)

      // change models and call update
      store.state.models = [{ id: 'c' }]
      store.dispatch('updateModelContainers')

      // check if store created modelcontainers
      expect(store.state.modelContainers.length).to.equal(1)
      expect(store.state.activeModelContainer).to.not.exist
    })
  })

  describe('.update()', () => {
    it('updates properly', () => {
      sinon.spy(Promise, 'all')
      sinon.spy(store, 'dispatch')
      // set store state to 'updating' and update
      store.state.updating = true
      store.dispatch('update')
      // make sure no promises have been called
      expect(Promise.all).to.not.have.been.called
      expect(store.dispatch).to.not.have.been.calledWith('fetchModels')
      expect(store.dispatch).to.not.have.been.calledWith('fetchScenarios')
      expect(store.dispatch).to.not.have.been.calledWith('fetchModelDetails')

      // now set 'updating' state to false and call again
      store.state.updating = false
      store.dispatch('update')
      expect(store.state.updating).to.equal(true)

      expect(Promise.all).to.have.been.called
      expect(store.dispatch).to.have.been.calledWith('fetchModels')
      expect(store.dispatch).to.have.been.calledWith('fetchScenarios')
      expect(store.dispatch).to.have.been.calledWith('fetchModelDetails')
      store.dispatch.restore()
      Promise.all.restore()
    })
  })

  // ***************************************************************************** updateUser()

  describe('.updateUser()', () => {
    it('updates properly', () => {
      sinon.spy(store, 'dispatch')
      sinon.spy($, 'ajax')
      // call update user
      store.dispatch('updateUser')

      // check
      expect(store.dispatch).to.have.been.calledWith('fetchUser')
      expect($.ajax).to.have.been.called
      expect($.ajax.args).to.eql([[{
        url: '/api/v1/users/me/',
        data: {
          key: 'val'
        },
        traditional: true,
        dataType: 'json'
      }]])
      store.dispatch.restore()
      $.ajax.restore()
    })
  })

  // ***************************************************************************** updateScenarioContainers()

  describe('.updateScenarioContainers()', () => {
    it('updates properly', () => {
      sinon.spy(store, 'dispatch')
      // make sure there are no model containers
      expect(store.state.scenarioContainers.length).to.be.equal(0)

      // change models and call update
      store.state.scenarios = [{ id: 'a' }]
      store.dispatch('updateScenarioContainers')

      // check if store created modelcontainers
      expect(store.state.scenarioContainers.length).to.be.equal(1)

      // change models and call update
      store.state.scenarios = [{ id: 'a' }, { id: 'b' }]
      store.dispatch('updateScenarioContainers')

      // check if store created modelcontainers
      expect(store.state.scenarioContainers.length).to.be.equal(2)

      // change models and call update
      store.state.scenarios = [{ id: 'c' }]
      store.dispatch('updateScenarioContainers')

      // check if store created modelcontainers
      expect(store.state.scenarioContainers.length).to.be.equal(1)
      store.dispatch.restore()
    })
  })
  // ***************************************************************************** deleteModel()

  describe('.deleteModel()', () => {
    it('deletes properly', () => {
      sinon.spy($, 'ajax')
      const model = { id: 'a' }
      const scenario = { id: 'a', scene_set: ['a'] }

      // add models and update containers
      store.state.models = [model]
      store.dispatch('updateModelContainers')
      store.state.scenarios = [scenario]
      store.dispatch('updateScenarioContainers')

      // check if all containers are there
      expect(store.state.modelContainers.length).to.be.equal(1)
      expect(store.state.scenarioContainers.length).to.be.equal(1)
      expect(store.state.scenarioContainers[0].models.length).to.be.equal(1)
      // delete this active model
      store.dispatch('deleteModel', { modelContainer: store.state.modelContainers[0] })
        .catch(err => {
          console.log(err)
        })

      // check if all is deleted properly
      expect(store.state.modelContainers.length).to.be.equal(0)
      expect(store.state.scenarioContainers[0].models.length).to.be.equal(0)
      expect(store.state.activeModelContainer).to.not.exist
      expect($.ajax).to.have.been.called
      $.ajax.restore()
    })
  })

  // ***************************************************************************** publishModel()

  describe('.publishModel()', () => {
    it('rejects properly with no model', (done) => {
      // call with erronous input
      expect(store.dispatch('publishModel')).to.be.rejected.notify(done)
    })

    it('rejects properly with no target', (done) => {
      // add models and update containers
      store.state.models = [{ id: 'a' }]
      store.dispatch('updateModelContainers')
      store.state.activeModelContainer = store.state.modelContainers[0]

      // call with erronous input
      expect(store.dispatch('publishModel', { modelContainer: store.state.activeModelContainer })).to.be.rejected.notify(done)
    })
    //
    it('rejects properly with wrong target', (done) => {
      // add models and update containers
      store.state.models = [{ id: 'a' }]
      store.dispatch('updateModelContainers')
      store.state.activeModelContainer = store.state.modelContainers[0]

      // call with erronous input
      expect(store.dispatch('publishModel', { modelContainer: store.state.activeModelContainer, domain: 'whooogarghblblbl' })).to.be.rejected.notify(done)
    })
    //
    // it('publishes properly', () => {
    //   // sinon.spy($, 'ajax')
    //   // add models and update containers
    //   store.state.models = [{ id: 'a' }]
    //   store.dispatch('updateModelContainers')
    //   store.state.activeModelContainer = store.state.modelContainers[0]

    //   // call with correct input
    //   expect(store.dispatch('publishModel', { modelContainer: store.state.activeModelContainer, domain: 'company' }))
    //   // expect($.ajax).to.have.been.called
    //   // $.ajax.restore()
    // })
  })
})

// ***************************************************************************** resetSelectedModels()
// test component
describe('Store', () => {
  describe('.resetSelectedModels()', () => {
    it('resets nothing when no models are selected', (done) => {
      sinon.spy(Promise, 'all')
      store.state.modelContainers = []
      store.dispatch('updateModelContainers')

      const pr = store.dispatch('resetSelectedModels')

      expect(Promise.all).to.have.been.called
      expect(pr).to.become([]).notify(done)
      Promise.all.restore()
    })

    it('resets a model when this model is selected', (done) => {
      // stub resetModel, remove spy that was set before.
      // store.dispatch.restore()
      sinon.spy(Promise, 'all')
      const dispatch = sinon.stub(store, 'dispatch')
      dispatch.withArgs('resetModel').returns(Promise.resolve({ status: 'ok' }))
      dispatch.callThrough()

      store.state.models = [{ id: 'a' }, { id: 'b' }]
      store.dispatch('updateModelContainers')
      store.state.modelContainers[0].selected = true

      const pr = store.dispatch('resetSelectedModels')

      expect(Promise.all).to.have.been.called
      expect(pr).to.become([{ status: 'ok' }]).notify(done)
      Promise.all.restore()

      // unstub resetModel
      dispatch.reset()
    })

    it('resets multiple models when multiple models are selected', (done) => {
      // stub resetModel, remove spy that was set before.
      store.dispatch.restore()
      sinon.spy(Promise, 'all')
      const dispatch = sinon.stub(store, 'dispatch')
      dispatch.withArgs('resetModel').returns(Promise.resolve({ status: 'ok' }))
      dispatch.callThrough()

      store.state.models = [{ id: 'a' }, { id: 'b' }]
      store.dispatch('updateModelContainers')
      store.state.modelContainers[0].selected = true
      store.state.modelContainers[1].selected = true

      const pr = store.dispatch('resetSelectedModels')

      expect(Promise.all).to.have.been.called
      expect(pr).to.become([{ status: 'ok' }, { status: 'ok' }]).notify(done)

      // unstub resetModel
      dispatch.reset()
      Promise.all.restore()
    })
  })
  // ***************************************************************************** startSelectedModels()

  describe('.startSelectedModels()', () => {
    it('starts nothing when no models are selected', (done) => {
      store.dispatch.restore()
      sinon.spy(Promise, 'all')
      store.state.modelContainers = []
      store.dispatch('updateModelContainers')
      const pr = store.dispatch('startSelectedModels')

      expect(Promise.all).to.have.been.called
      expect(pr).to.become([]).notify(done)
      Promise.all.restore()
    })

    it('starts a model when this model is selected', (done) => {
    // stub startModel, remove spy that was set before.
      sinon.spy(Promise, 'all')
      const dispatch = sinon.stub(store, 'dispatch')
      dispatch.withArgs('startModel').returns(Promise.resolve({ status: 'ok' }))
      dispatch.callThrough()

      store.state.models = [{ id: 'a' }, { id: 'b' }]
      store.dispatch('updateModelContainers')
      store.state.modelContainers[0].selected = true

      const pr = store.dispatch('startSelectedModels')

      expect(Promise.all).to.have.been.called
      expect(pr).to.become([{ status: 'ok' }]).notify(done)

      // unstub startModel
      store.dispatch.restore()
      Promise.all.restore()
    })

    it('starts multiple models when multiple models are selected', (done) => {
      sinon.spy(Promise, 'all')
      // stub startModel, remove spy that was set before.
      const dispatch = sinon.stub(store, 'dispatch')
      dispatch.withArgs('startModel').returns(Promise.resolve({ status: 'ok' }))
      dispatch.callThrough()

      store.state.models = [{ id: 'a' }, { id: 'b' }]
      store.dispatch('updateModelContainers')
      store.state.modelContainers[0].selected = true
      store.state.modelContainers[1].selected = true

      const pr = store.dispatch('startSelectedModels')

      expect(Promise.all).to.have.been.called
      expect(pr).to.become([{ status: 'ok' }, { status: 'ok' }]).notify(done)

      // unstub startModel
      store.dispatch.restore()
      Promise.all.restore()
    })
  })
  // ***************************************************************************** stopSelectedModels()

  describe('.stopSelectedModels()', () => {
    it('stops nothing when no models are selected', (done) => {
      sinon.spy(Promise, 'all')
      store.state.modelContainers = []
      store.dispatch('updateModelContainers')

      const pr = store.dispatch('stopSelectedModels')

      expect(Promise.all).to.have.been.called
      expect(pr).to.become([]).notify(done)
      Promise.all.restore()
    })

    it('stops a model when this model is selected', (done) => {
      sinon.spy(Promise, 'all')
      // stub stopModel, remove spy that was set before.
      const dispatch = sinon.stub(store, 'dispatch')
      dispatch.withArgs('stopModel').returns(Promise.resolve({ status: 'ok' }))
      dispatch.callThrough()
      store.state.models = [{ id: 'a' }, { id: 'b' }]
      store.dispatch('updateModelContainers')
      store.state.modelContainers[0].selected = true

      const pr = store.dispatch('stopSelectedModels')

      expect(Promise.all).to.have.been.called
      expect(pr).to.become([{ status: 'ok' }]).notify(done)

      // unstub stopModel
      store.dispatch.restore()
      Promise.all.restore()
    })

    it('stops multiple models when multiple models are selected', (done) => {
      // stub stopModel, remove spy that was set before.
      sinon.spy(Promise, 'all')
      const dispatch = sinon.stub(store, 'dispatch')
      dispatch.withArgs('stopModel').returns(Promise.resolve({ status: 'ok' }))
      dispatch.callThrough()
      store.state.models = [{ id: 'a' }, { id: 'b' }]
      store.dispatch('updateModelContainers')
      store.state.modelContainers[0].selected = true
      store.state.modelContainers[1].selected = true

      const pr = store.dispatch('stopSelectedModels')

      expect(Promise.all).to.have.been.called
      expect(pr).to.become([{ status: 'ok' }, { status: 'ok' }]).notify(done)

      // unstub stopModel
      store.dispatch.restore()
      Promise.all.restore()
    })
  })

  // ***************************************************************************** deleteSelectedModels()

  describe('.deleteSelectedModels()', () => {
    it('deletes nothing when no models are selected', (done) => {
      sinon.spy(Promise, 'all')
      store.state.modelContainers = []
      store.dispatch('updateModelContainers')

      const pr = store.dispatch('deleteSelectedModels')

      expect(Promise.all).to.have.been.called
      expect(pr).to.become([]).notify(done)
      Promise.all.restore()
    })

    it('deletes a model when this model is selected', (done) => {
      sinon.spy(Promise, 'all')
      // stub deleteModel, remove spy that was set before.
      const dispatch = sinon.stub(store, 'dispatch')
      dispatch.withArgs('deleteModel').returns(Promise.resolve({ status: 'ok' }))
      dispatch.callThrough()

      store.state.models = [{ id: 'a' }, { id: 'b' }]
      store.dispatch('updateModelContainers')
      store.state.modelContainers[0].selected = true

      const pr = store.dispatch('deleteSelectedModels')

      expect(Promise.all).to.have.been.called
      expect(pr).to.become([{ status: 'ok' }]).notify(done)

      // unstub deleteModel
      store.dispatch.restore()
      Promise.all.restore()
    })

    it('deletes multiple models when multiple models are selected', (done) => {
      sinon.spy(Promise, 'all')
      // stub deleteModel, remove spy that was set before.
      const dispatch = sinon.stub(store, 'dispatch')
      dispatch.withArgs('deleteModel').returns(Promise.resolve({ status: 'ok' }))
      dispatch.callThrough()

      store.state.models = [{ id: 'a' }, { id: 'b' }]
      store.dispatch('updateModelContainers')
      store.state.modelContainers[0].selected = true
      store.state.modelContainers[1].selected = true

      const pr = store.dispatch('deleteSelectedModels')

      expect(Promise.all).to.have.been.called
      expect(pr).to.become([{ status: 'ok' }, { status: 'ok' }]).notify(done)

      // unstub deleteModel
      store.dispatch.restore()
      Promise.all.restore()
    })
  })

  // ***************************************************************************** shareSelectedModels()

  describe('.shareSelectedModels()', () => {
    it('shares nothing when no models are selected', (done) => {
      store.state.modelContainers = []
      store.dispatch('updateModelContainers')
      expect(store.dispatch('shareSelectedModels', '')).to.be.fulfilled.notify(done)
    })

    it('shares nothing when no models are selected and the company publish target is given', (done) => {
      store.state.modelContainers = []
      store.dispatch('updateModelContainers')
      expect(store.dispatch('shareSelectedModels', 'company')).to.be.fulfilled.notify(done)
    })

    it('shares nothing when no publish target is given', (done) => {
      store.state.models = [{ id: 'a' }, { id: 'b' }]
      store.dispatch('updateModelContainers')
      store.state.modelContainers[0].selected = true
      expect(store.dispatch('shareSelectedModels')).to.be.fulfilled.notify(done)
    })

    it('shares nothing when the wrong publish target is given', (done) => {
      store.state.models = [{ id: 'a' }, { id: 'b' }]
      store.dispatch('updateModelContainers')
      store.state.modelContainers[0].selected = true
      expect(store.dispatch('shareSelectedModels', 'the wrong target')).to.be.fulfilled.notify(done)
    })

    it('shares a model the models is selected and the company publish target is given', () => {
      sinon.spy($, 'ajax')
      store.state.models = [{ id: 'a' }, { id: 'b' }]
      store.dispatch('updateModelContainers')
      store.state.modelContainers[0].selected = true

      store.dispatch('shareSelectedModels', 'company')
      expect($.ajax).to.have.been.called
      $.ajax.restore()
    })
  })

  // ***************************************************************************** downloadSelectedModels()

  describe('.downloadSelectedModels()', () => {
    sinon.spy($, 'ajax')
    it('downloads nothing when no models are selected', (done) => {
      store.state.modelContainers = []
      store.dispatch('updateModelContainers')

      const p = store.dispatch('downloadSelectedModels')

      // window.open.should.have.not.been.called;
      expect(p).to.be.rejected.notify(done)
    })

    it('downloads nothing when no selections are given', (done) => {
      store.state.models = [{ id: 'a' }, { id: 'b' }]
      store.dispatch('updateModelContainers')
      store.state.modelContainers[0].selected = true

      const p = store.dispatch('downloadSelectedModels')

      // window.open.should.h)ave.not.been.called;
      expect(p).to.be.rejected.notify(done)
    })

    it('downloads nothing when the wrong input is given', (done) => {
      store.state.models = [{ id: 'a' }, { id: 'b' }]
      store.dispatch('updateModelContainers')
      store.state.modelContainers[0].selected = true

      const p = store.dispatch('downloadSelectedModels', ('the wrong input'))

      // window.open.should.have.not.been.called;
      expect(p).to.be.rejected.notify(done)
    })

    it('downloads nothing when the all selections are false', (done) => {
      store.state.models = [{ id: 'a' }, { id: 'b' }]
      store.dispatch('updateModelContainers')
      store.state.modelContainers[0].selected = true

      const p = store.dispatch('downloadSelectedModels', ({ option: { active: false } }))

      // window.open.should.have.not.been.called;
      expect(p).to.be.rejected.notify(done)
    })

    it('downloads something when a model is selected and a download option is selected', () => {
      store.state.models = [{ id: 'a' }, { id: 'b' }]
      store.dispatch('updateModelContainers')
      store.state.modelContainers[0].selected = true

      store.dispatch('downloadSelectedModels', ({ option: { active: true } }))

    // window.open.should.have.been.called;
    })

    it('downloads nothing when a model is selected but all selections are false', (done) => {
      store.state.modelContainers = []
      store.dispatch('updateModelContainers')

      const p = store.dispatch('downloadSelectedModels', ({ option: { active: false } }))

      // window.open.should.have.not.been.called;
      expect(p).to.be.rejected.notify(done)
    })
    $.ajax.restore()
  })
})
