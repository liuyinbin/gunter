import Vue from 'vue'
import Router from 'vue-router'
import gunter from '@/components/gante_test/gante_test'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'gunter',
      component: gunter
    }
  ]
})
