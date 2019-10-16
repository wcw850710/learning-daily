const routes = [
    { path: '/', component: () => import('./views/Chart') },
    { path: '/login', component: () => import('./views/Login') },
    { path: '/chart', component: () => import('./views/Chart') },
]

export default routes
