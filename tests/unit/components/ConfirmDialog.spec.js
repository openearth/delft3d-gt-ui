import chai, { assert } from 'chai'
import { shallowMount } from '@vue/test-utils'
import ConfirmDialog from '../../../src/components/ConfirmDialog.vue'
import chaiAsPromised from 'chai-as-promised'

import sinonChai from 'sinon-chai'
import $ from 'jquery'

// setup chai
chai.use(chaiAsPromised)
chai.use(sinonChai)

describe('ConfirmDialog.vue', () => {
  it('Is possible to instantiate component ConfirmDialog', (done) => {
    const confirmDialog = shallowMount(ConfirmDialog, { propsData: { dialogId: 'test', confirmButtonTitle: 'Title', modal: true } })

    assert.isOk(confirmDialog)
    done()
  })
})

describe('ConfirmDialog', () => {
  it("Does confirmdialog have right 'props'", (done) => {
    const defaultProps = {
      dialogId: {
        type: String,
        required: true
      },
      confirmButtonTitle: {
        type: String,
        required: true
      },
      modal: {
        type: Boolean
      }
    }

    assert.deepEqual(ConfirmDialog.props, defaultProps, 'Match default properties')

    done()
  })

  it('Is possible to make a confirmdialog', (done) => {
    const confirmDialog = shallowMount(ConfirmDialog, { propsData: { dialogId: 'test', confirmButtonTitle: 'Title', modal: true } })

    // Simple test, see if object exists
    assert.isOk(confirmDialog)
    done()
  })

  it('Is possible to confirm', (done) => {
    const confirmDialog = shallowMount(ConfirmDialog, { propsData: { dialogId: 'test', confirmButtonTitle: 'Title', modal: true } })

    // Call confirm,
    confirmDialog.vm.confirm = () => {
      done()
    }

    confirmDialog.vm.confirm()
  })

  it('Is possible to show', (done) => {
    const confirmDialog = shallowMount(ConfirmDialog, { propsData: { dialogId: 'test', confirmButtonTitle: 'Title', modal: true } })

    // Simple test, see if object exists

    $('#confirm-dialog-test-holder').html("<div id='test-dialog'>dialog</div>")
    $.fn.modal = undefined

    confirmDialog.vm.show()
    done()
  })

  it('Is possible to show - with modal', (done) => {
    const confirmDialog = shallowMount(ConfirmDialog, { propsData: { dialogId: 'test', confirmButtonTitle: 'Title', modal: true } })

    // Simple test, see if object exists

    $('#confirm-dialog-test-holder').html("<div id='test-dialog'>dialog</div>")

    // Normally this is applied directly to an element, with a jquery reference, but we cannot do that using tests?
    $.fn.modal = () => {
      done()
      $.fn.modal = undefined // Unset for later calls.
    }

    confirmDialog.vm.show()
  })

  it('Is possible to hide', (done) => {
    const confirmDialog = shallowMount(ConfirmDialog, { propsData: { dialogId: 'test', confirmButtonTitle: 'Title', modal: true } })

    $('#confirm-dialog-test-holder').html("<div id='test-dialog'>dialog</div>")

    confirmDialog.vm.hide()

    done()
  })

  it('Is possible to hide - with modal', (done) => {
    const confirmDialog = shallowMount(ConfirmDialog, { propsData: { dialogId: 'test', confirmButtonTitle: 'Title', modal: true } })

    $('#confirm-dialog-test-holder').html("<div id='test-dialog'>dialog</div>")

    // Normally this is applied directly to an element, with a jquery reference, but we cannot do that using tests?
    $.fn.modal = () => {
      done()
      $.fn.modal = undefined // Unset for later calls.
    }

    confirmDialog.vm.hide()
  })

  it('Is possible to showAlert', (done) => {
    const confirmDialog = shallowMount(ConfirmDialog, { propsData: { dialogId: 'test', confirmButtonTitle: 'Title', modal: true } })

    // Simple test, see if object exists
    confirmDialog.vm.showAlert()

    done()
  })
})
