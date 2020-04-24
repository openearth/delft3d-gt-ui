import { shallowMount } from '@vue/test-utils'
import ModelDetails from '@/views/ModelDetails.vue'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import $ from 'jquery'
import chai from 'chai'
import store from '@/store'

// setup chai
chai.use(chaiAsPromised)
chai.use(sinonChai)
/* eslint-disable */
let should = chai.should()

const modelDetails = shallowMount(ModelDetails)

// stub publishDialog
// const createDialog = (name) => {
//   let el = document.createElement('confirm-dialog')
//
//   modelDetails.vm.$children.push(el)
//   el.$options = { 'name': 'confirm-dialog' }
//   el.dialogId = name
//   el.showAlert = sinon.stub()
//   el.show = sinon.stub()
//   el.hide = sinon.stub()
//
//   return el
// }
// test component
describe('ModelDetails', () => {
  beforeEach(() => {
    // import component
    sinon.spy($, 'ajax')
    sinon.spy(Promise, 'all')
    sinon.spy(Promise, 'reject')
    sinon.spy(Promise, 'resolve')
    // sinon.spy(window, "open");
  })

  afterEach(() => {
    // Unwrap spies
    $.ajax.restore()
    Promise.all.restore()
    Promise.reject.restore()
    Promise.resolve.restore()
    // window.open.restore();
  })

  // ***************************************************************************** dateCreatedText

  describe('.dateCreatedText()', () => {
    it('', () => {
      store.state.activeModelContainer = undefined
      modelDetails.vm.dateCreatedText.should.equal('')

      store.state.activeModelContainer = { 'data': { 'date_created': '' } }
      modelDetails.vm.dateCreatedText.should.equal('')

      store.state.activeModelContainer = { 'data': { 'date_created': '2003-02-01T00:00:00.000000Z' } }
      modelDetails.vm.dateCreatedText.should.equal('1/2/2003')

      store.state.activeModelContainer = undefined
    })
  })

  // ***************************************************************************** isReadOnly

  describe('.isReadOnly', () => {
    it('', () => {
      store.state.activeModelContainer = undefined
      modelDetails.vm.isReadOnly.should.equal(false)

      store.state.activeModelContainer = { 'data': {} }
      modelDetails.vm.isReadOnly.should.equal(false)

      store.state.activeModelContainer = { 'data': { 'shared': 'p' } }
      modelDetails.vm.isReadOnly.should.equal(false)

      store.state.activeModelContainer = { 'data': { 'shared': 'anything but p' } }
      modelDetails.vm.isReadOnly.should.equal(true)

      store.state.activeModelContainer = undefined
    })
  })

  // ***************************************************************************** isIdle

  describe('.isIdle', () => {
    it('', () => {
      store.state.activeModelContainer = undefined
      modelDetails.vm.isIdle.should.equal(false)

      store.state.activeModelContainer = { 'data': {} }
      modelDetails.vm.isIdle.should.equal(false)

      store.state.activeModelContainer = { 'data': { 'state': 'Idle' } }
      modelDetails.vm.isIdle.should.equal(false) // it checks whether the string is exactly as below

      store.state.activeModelContainer = { 'data': { 'state': 'Idle: waiting for user input' } }
      modelDetails.vm.isIdle.should.equal(true)

      store.state.activeModelContainer = undefined
    })
  })

  // ***************************************************************************** isRunning

  describe('.isRunning', () => {
    it('', () => {
      store.state.activeModelContainer = undefined
      modelDetails.vm.isRunning.should.equal(false)

      store.state.activeModelContainer = { 'data': {} }
      modelDetails.vm.isRunning.should.equal(false)

      store.state.activeModelContainer = { 'data': { 'state': 'Finished' } }
      modelDetails.vm.isRunning.should.equal(false)

      store.state.activeModelContainer = { 'data': { 'state': 'Running simulation' } }
      modelDetails.vm.isRunning.should.equal(true)

      store.state.activeModelContainer = undefined
    })
  })

  // ***************************************************************************** getEntrypoints

  describe('.getEntrypoints', () => {
    it('', () => {
      store.state.activeModelContainer = undefined
      modelDetails.vm.getEntrypoints.should.equal(false)

      store.state.activeModelContainer = { 'notdata': {} }
      modelDetails.vm.getEntrypoints.should.equal(false)
      //
      store.state.activeModelContainer = { 'data': { 'entrypoints': ['gtsm-main'] } }
      modelDetails.vm.getEntrypoints.should.eql(['gtsm-main'])

      store.state.activeModelContainer = undefined
    })
  })

  // ***************************************************************************** isFinished

  describe('.isFinished', () => {
    it('', () => {
      store.state.activeModelContainer = undefined
      modelDetails.vm.isFinished.should.equal(false)

      store.state.activeModelContainer = { 'data': {} }
      modelDetails.vm.isFinished.should.equal(false)

      store.state.activeModelContainer = { 'data': { 'state': 'Finished' } }
      modelDetails.vm.isFinished.should.equal(true)

      store.state.activeModelContainer = undefined
    })
  })

  // ***************************************************************************** isQueued

  describe('.isQueued', () => {
    it('', () => {
      store.state.activeModelContainer = undefined
      modelDetails.vm.isQueued.should.equal(false)

      store.state.activeModelContainer = { 'data': {} }
      modelDetails.vm.isQueued.should.equal(false)

      store.state.activeModelContainer = { 'data': { 'state': 'Queued' } }
      modelDetails.vm.isQueued.should.equal(true)

      store.state.activeModelContainer = undefined
    })
  })

  // ***************************************************************************** shareLevelText

  describe('.shareLevelText', () => {
    it('', () => {
      store.state.activeModelContainer = undefined
      modelDetails.vm.shareLevelText.should.equal('-')

      store.state.activeModelContainer = { 'data': { 'shared': 'p' } }
      modelDetails.vm.shareLevelText.should.equal('private')

      store.state.activeModelContainer = { 'data': { 'shared': 'c' } }
      modelDetails.vm.shareLevelText.should.equal('company')

      store.state.activeModelContainer = { 'data': { 'shared': 'w' } }
      modelDetails.vm.shareLevelText.should.equal('world')

      store.state.activeModelContainer = { 'data': { 'shared': 'u' } }
      modelDetails.vm.shareLevelText.should.equal('updating')

      store.state.activeModelContainer = undefined
    })
  })

  // ***************************************************************************** outdated

  describe('.outdated', () => {
    it('', () => {
      store.state.activeModelContainer = undefined
      modelDetails.vm.outdated.should.equal(false)

      store.state.activeModelContainer = { 'data': { 'outdated': undefined } }
      modelDetails.vm.outdated.should.equal(false)

      store.state.activeModelContainer = { 'data': { 'outdated': true } }
      modelDetails.vm.outdated.should.equal(true)

      store.state.activeModelContainer = undefined
    })
  })

  // ***************************************************************************** downloadFiles()

  describe('.downloadFiles()', () => {
    it('', () => {
      modelDetails.vm.downloadFiles()
      // window.open.should.have.not.been.called;
      modelDetails.vm.sharedState.activeModelContainer = { 'id': 'a' }
      modelDetails.vm.selectedDownloads.export_d3dinput = true
      modelDetails.vm.downloadFiles()
      // window.open.should.have.been.calledWith("/api/v1/scenes/a/export/?format=json&options=export_d3dinput");
    })
  })

  // ***************************************************************************** hasPostProcessData()

  describe('.hasPostProcessData()', () => {
    it('', () => {
      modelDetails.vm.hasPostProcessData().should.equal(false)
      modelDetails.vm.sharedState.activeModelContainer = { 'id': 'a' }
      modelDetails.vm.hasPostProcessData().should.equal(false)
      modelDetails.vm.sharedState.activeModelContainer = { 'id': 'a', 'data': { 'info': { 'postprocess_output': { 'stuff': 'value' } } } }
      modelDetails.vm.hasPostProcessData().should.equal(true)
    })
  })

  // ***************************************************************************** doNothing()

  describe('.doNothing()', () => {
    it('', () => {
      modelDetails.vm.doNothing().should.equal(false)
    })
  })
})