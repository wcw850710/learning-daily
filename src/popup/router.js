const routes = [
    { path: '/', component: () => import('./views/Home') },
    { path: '/login', component: () => import('./views/Login') },
    { path: '/chart', component: () => import('./views/Chart') },
    { path: '/user-profile', component: () => import('./views/UserProfile') },
    { path: '/explanation', component: () => import('./views/Explanation') },
]

export default routes
