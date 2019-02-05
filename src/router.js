import Vue from 'vue'
import Router from 'vue-router'
import ScenarioCreate from './views/ScenarioCreate'
import ModelDetails from './views/ModelDetails'
import SearchColumns from './views/SearchColumns'
import Login from './views/Login'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: SearchColumns
    },
    {
      path: '/models/:modelid',
      name: 'models',
      component: ModelDetails
    },
    {
      path: '/scenarios/create',
      name: 'scenarios-create',
      component: ScenarioCreate
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
})
