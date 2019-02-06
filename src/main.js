import Vue from 'vue'
import App from './App.vue'
import store from './store'
import './registerServiceWorker'
import router from './router'
import 'bootstrap/js/dist/util'
import 'bootstrap/js/dist/dropdown'

Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
