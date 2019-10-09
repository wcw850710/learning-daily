import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './router'
import AppComponent from './App/App.vue'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import firebaseConfig from '@/firebaseConfig'

const app = firebase.initializeApp({ databaseURL: firebaseConfig.databaseURL })
Vue.prototype.$db = app.database()

Vue.component('app-component', AppComponent)
Vue.use(VueRouter)
const router = new VueRouter({
    routes,
})
router.beforeEach((to, from, next) => {
    if (!window.localStorage.getItem('username') && to.path !== '/login') {
        next('/login')
    } else {
        next()
    }
})

new Vue({
    el: '#app',
    router,
    render: createElement => {
        return createElement(AppComponent)
    },
})
