import Vue from 'vue'
import VueRouter from './myRouter'
// import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
// import About from '../views/About.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: function () {
      return import(/* webpackChunkName: "about" */ '../views/About.vue')
    }
    // component: About
  }
]

const router = new VueRouter({
  // mode: 'history',
  routes
})

export default router
