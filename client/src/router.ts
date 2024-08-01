import { createWebHistory, createRouter } from 'vue-router'

import Home from './pages/Home.vue'
import Tenant from './pages/Tenant.vue'
import Report from './pages/Report.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/tenant/:tenantId', name: 'Tenant', component: Tenant },
  { path: '/tenant/:tenantId/:operationId', name: 'Report', component: Report },
]

const router = createRouter({
  history: createWebHistory(),
  mode: 'history',
  routes,
})

export default router