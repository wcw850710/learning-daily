import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './router'
import AppComponent from './App/App.vue'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: 'AIzaSyCtx5J2x18iLlMIDURgMecmaVkfh6_OSeQ',
    authDomain: 'pagemaker-23fec.firebaseapp.com',
    databaseURL: 'https://pagemaker-23fec.firebaseio.com',
    projectId: 'pagemaker-23fec',
    storageBucket: 'pagemaker-23fec.appspot.com',
    messagingSenderId: '693822124792',
    appId: '1:693822124792:web:c5bfb6f13bdd1e9d56410d',
}

var app = firebase.initializeApp({ databaseURL: firebaseConfig.databaseURL })
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
