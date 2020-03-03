<template>
<div id="template-confirm-dialog">
  <div class="modal default-hidden fade" :id="`${dialogId}-dialog`" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">
            <slot name="title"></slot>
          </h4>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        </div>
        <div class="modal-body">
          <slot name="body"></slot>
          <div class="alert alert-info" role="alert" :id="`${dialogId}-dialog-alert`">
            <slot name="alert"></slot>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-warning" v-on:click.stop="confirm">{{ confirmButtonTitle }}</button>
          <button type="button" class="btn btn-primary" v-on:click.stop="hide">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import $ from 'jquery'
export default {
  // not much in here.
  template: '#template-confirm-dialog',
  props: {
    'dialogId': {
      type: String,
      required: true
    },
    'confirmButtonTitle': {
      type: String,
      required: true
    },
    'modal': {
      type: Boolean
    }
  },
  watch: {
    modal (val) {
      if (val) {
        this.show()
      } else {
        this.hide()
      }
    }
  },

  methods: {
    confirm () {
      this.$emit('confirm')
      this.hide()
    },
    cancel () {
      this.$emit('cancel')
      this.hide()
    },
    show () {
      var el = $(`#${this.dialogId}-dialog`)

      // Hide extra alert by default.
      $(`#${this.dialogId}-dialog-alert`).hide()

      if (el.modal !== undefined) {
        el.modal({})
      }
    },

    hide () {
      var el = $(`#${this.dialogId}-dialog`)

      if (el.modal !== undefined) {
        el.modal('hide')
      }
    },

    showAlert (isVisible) {
      $(`#${this.dialogId}-dialog-alert`).toggle(isVisible)
    }
  }
}
</script>

<style lang="scss">
@import '../assets/variables.scss';
</style>
