import { createRouter, createWebHistory } from 'vue-router'

// Shared Views
import Login from './shared/presentation/views/auth/login.vue'
import Register from './shared/presentation/views/auth/register.vue'

import Dashboard from './dashboard/presentation/views/dashboard.vue'
import FleetManagement from './fleet-management/presentation/views/fleet-management.vue'
import Reports from './reporting/presentation/views/reports.vue'
import Users from './ user-management/presentation/views/users.vue'
import DeliveryManagement from './delivery-management/presentation/views/deliveries.vue'
import Fuel from './fuel-consumption/presentation/views/fuel-consumption.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/fleet-management',
    name: 'FleetManagement',
    component: FleetManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: { requiresAuth: true }
  },
  {
    path: '/deliveries',
    name: 'DeliveryManagement',
    component: DeliveryManagement,
    meta: { requiresAuth: true }
  },
  {
    path:'/fuel-consumption',
    name: 'Fuel',
    component: Fuel,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('movesys_token') !== null
  
  console.log('🛣️ Router Guard:', {
    to: to.path,
    from: from.path,
    isAuthenticated,
    requiresAuth: to.meta.requiresAuth
  })
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('🔒 Redirigiendo a login - no autenticado')
    next('/login')
  } else if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) {
    console.log('🏠 Redirigiendo a dashboard - ya autenticado')
    next('/dashboard')
  } else {
    console.log('✅ Navegación permitida')
    next()
  }
})

export default router
