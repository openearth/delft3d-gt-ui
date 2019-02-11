<template>
<div id="template-confirm-dialog">
  <div class="modal modal-dialog model-content default-hidden fade" :id="`${dialogId}-dialog`" tabindex="-1" role="dialog">
    <div class="modal-header">
      <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
      <h4 class="modal-title">
        <slot name="title"></slot>
      </h4>
    </div>
    <div class="modal-body">
      <slot name="body"></slot>
      <div class="alert alert-info" role="alert" :id="`${dialogId}-dialog-alert`">
        <slot name="alert"></slot>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-warning" v-on:click="confirm">{{ confirmButtonTitle }}</button>
      <button type="button" class="btn btn-primary" v-on:click="cancel">Cancel</button>
    </div>
  </div>
</div>
</template>

<script>
import $ from 'jquery'
export default {
  // not much in here.
  template: '#template-confirm-dialog',
  data: function () {
    return {
      onConfirm: null,
      onCancel: null
    }
  },
  props: {
    'dialogId': {
      type: String,
      required: true
    },
    'confirmButtonTitle': {
      type: String,
      required: true
    }
  },
  methods: {
    confirm: function () {
      if (this.onConfirm) {
        this.onConfirm()
      }
      this.hide()
    },

    cancel: function () {
      if (this.onCancel) {
        this.onCancel()
      }
      this.hide()
    },

    show: function () {
      var el = $('#' + this.dialogId + '-dialog')

      // Hide extra alert by default.
      $('#' + this.dialogId + '-dialog-alert').hide()

      if (el.modal !== undefined) {
        el.modal({})
      }
    },

    hide: function () {
      var el = $('#' + this.dialogId + '-dialog')

      if (el.modal !== undefined) {
        el.modal('hide')
      }
    },

    showAlert: function (isVisible) {
      $('#' + this.dialogId + '-dialog-alert').toggle(isVisible)
    }
  }
}
</script>

<style lang="scss">
@import '../assets/variables.scss';
</style>
