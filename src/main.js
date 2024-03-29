import Vue from 'vue'
import App from './App.vue'
import store from './store'
import './registerServiceWorker'
import router from './router'
import $ from 'jquery'
import 'popper.js/dist/popper.js'
import 'bootstrap/js/dist/util'
import 'bootstrap/js/dist/dropdown'
import 'bootstrap/js/dist/collapse'
import 'bootstrap/js/dist/modal'
import 'bootstrap/js/dist/tooltip'
import 'bootstrap-datepicker/dist/js/bootstrap-datepicker'
import 'bootstrap-colorpicker/dist/js/bootstrap-colorpicker'
import 'bootstrap4-tagsinput/tagsinput'
import 'bootstrap-select'

import 'bootstrap-colorpicker/dist/css/bootstrap-colorpicker.css'
import { ValidationProvider } from 'vee-validate'

import './assets/main.scss'

Vue.config.productionTip = false
Vue.component('ValidationProvider', ValidationProvider)

new Vue({
  store,
  router,
  render: h => h(App),
  created () {
    $.ajaxSetup({
      cache: false
    })
  }
}).$mount('#app')
