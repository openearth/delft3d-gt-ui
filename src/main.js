import Vue from 'vue'
import App from './App.vue'
import store from './store'
import './registerServiceWorker'
import router from './router'
import $ from 'jquery'

import 'bootstrap/js/dist/util'
import 'bootstrap/js/dist/dropdown'
import 'bootstrap/js/dist/collapse'
import 'bootstrap/js/dist/modal'
import 'bootstrap-datepicker/dist/js/bootstrap-datepicker'
import 'bootstrap-select/dist/js/bootstrap-select'
import VeeValidate from 'vee-validate'

Vue.config.productionTip = false
Vue.use(VeeValidate, {
  classes: true
})

new Vue({
  store,
  router,
  render: h => h(App),
  created () {
    $.ajaxSetup({ cache: false })
    console.log('app created')
  }
}).$mount('#app')
