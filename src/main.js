import Vue from 'vue'
import App from './App.vue'
import store from './store'
import './registerServiceWorker'
import router from './router'

import $ from 'jquery'
import 'bootstrap/js/dist/util'
import 'bootstrap/js/dist/dropdown'
import 'bootstrap/js/dist/collapse'

Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: h => h(App),
  created () {
    $.ajaxSetup({ cache: false })
    console.log('app created')
  }
}).$mount('#app')
