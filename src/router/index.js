import Vue from 'vue'
import Router from 'vue-router'
import Converter from '@/components/Converter'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Converter',
      component: Converter
    }
  ]
})
