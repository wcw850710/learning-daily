import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './router'
import AppComponent from './App/App.vue'
import '@/assets/fontawesome/css/all.min.css'
import '@/assets/libs/style.sass'
import * as myFuncs from '@/assets/libs/my'

const bg = chrome.extension.getBackgroundPage()
Vue.prototype.$bg = bg
Vue.prototype.$db = bg.$db()
Vue.prototype.$my = myFuncs.default

Vue.component('app-component', AppComponent)
Vue.use(VueRouter)
const router = new VueRouter({
    routes,
})
router.beforeEach((to, from, next) => {
    chrome.storage.local.get(['username'], result => {
        let username = result.username
        if (!username && to.path !== '/login') {
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
