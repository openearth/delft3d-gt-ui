<template id="template-alert-message">
  <div v-if="visible" :class="`alert message-alert alert-dismissible alert-${type}`" role="alert">
    <button type="button" class="close" @click="hide"><span aria-hidden="true">&times;</span></button>
    <p>{{message}}</p>
  </div>
</template>

<script>
export default {
  template: '#template-alert-message',
  props: {
    alertMessage: {
      required: true
    }
  },
  data () {
    return {
      // Default alert-type. Bootstrap types, so valid options are: success, info, warning, danger
      type: 'info',

      // Default hidden:
      visible: false,

      // And no text by default:
      message: '',

      timeoutID: undefined
    }
  },
  watch: {
    alertMessage () {
      this.showAlert()
      console.log('watching alertmessage')
    }
  },
  mounted () {
    this.showAlert()
  },
  methods: {
    hide () {
      this.visible = false
      this.$emit('hide-alert')
    },
    showAlert () {
      console.log(this.alertMessage, !this.alertMessage)
      if (!this.alertMessage) {
        return
      }
      this.visible = true

      const msg = this.alertMessage

      this.message = msg.message
      // console.log(this.msg, this.message)
      // Change type?
      if (msg.type !== undefined) {
        this.type = msg.type
      }

      // Automatically hide this message in how many ms?
      if (msg.showTime !== undefined) {
        window.clearTimeout(this.timeoutID)

        this.timeoutID = setTimeout(() => {
          this.visible = false
        }, msg.showTime)
      }
    }
  }
}
</script>

<style lang="scss">
@import '../assets/variables.scss';
.alert.message-alert {
  position: absolute;
  bottom: 0px;
  margin: $padding;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  width: 400px;
  left: calc(50% - 200px);
}

</style>
