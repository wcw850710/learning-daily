import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './router'
import AppComponent from './App/App.vue'
import '@/assets/fontawesome/css/all.min.css'
import '@/assets/libs/style.sass'
import * as myFuncs from '@/assets/libs/my'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'

const firebaseConfig = {
    apiKey: 'AIzaSyCtx5J2x18iLlMIDURgMecmaVkfh6_OSeQ',
    authDomain: 'pagemaker-23fec.firebaseapp.com',
    databaseURL: 'https://pagemaker-23fec.firebaseio.com',
    storageBucket: 'pagemaker-23fec.appspot.com',
}
const bg = chrome.extension.getBackgroundPage()
const app = firebase.initializeApp(firebaseConfig)
const auth = app.auth()
const db = app.database()
bg._app = app

Vue.prototype.$bg = bg
Vue.prototype.$auth = auth
Vue.prototype.$db = db
Vue.prototype.$my = myFuncs.default

Vue.component('app-component', AppComponent)
Vue.use(VueRouter)
const router = new VueRouter({
    routes,
})
router.beforeEach((to, from, next) => {
    chrome.storage.local.get('id', result => {
        let id = result.id
        if (!id && to.path !== '/login') {
            next('/login')
        } else {
            next()
        }
    })
})

new Vue({
    el: '#app',
    router,
    render: createElement => {
        return createElement(AppComponent)
    },
})
