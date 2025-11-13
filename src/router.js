import { createRouter, createWebHistory } from 'vue-router'

// Shared Views
import Login from './shared/presentation/views/auth/login.vue'
import Register from './shared/presentation/views/auth/register.vue'

import Dashboard from './dashboard/presentation/views/dashboard.vue'
import FleetManagement from './fleet-management/presentation/views/fleet-management.vue'
import VehicleForm from './fleet-management/presentation/views/vehicle-form.vue'
import Reports from './reporting/presentation/views/reports.vue'
import Users from './user-management/presentation/views/users.vue'
import UserForm from './user-management/presentation/views/user-form.vue'
import DeliveryManagement from './delivery-management/presentation/views/deliveries.vue'
import DeliveryForm from './delivery-management/presentation/views/delivery-form.vue'
import Fuel from './fuel-consumption/presentation/views/fuel-consumption.vue'
import FuelForm from './fuel-consumption/presentation/views/fuel-form.vue'
import Maintenance from './maintenance-management/presentation/views/maintenance.vue'
import MaintenanceForm from './maintenance-management/presentation/views/maintenance-form.vue'

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
    path: '/fleet-management/formulario',
    name: 'VehicleForm',
    component: VehicleForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/fleet-management/formulario/:id',
    name: 'VehicleFormEdit',
    component: VehicleForm,
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
    path: '/users/formulario',
    name: 'UserForm',
    component: UserForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/users/formulario/:id',
    name: 'UserFormEdit',
    component: UserForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/deliveries',
    name: 'DeliveryManagement',
    component: DeliveryManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/deliveries/formulario',
    name: 'DeliveryForm',
    component: DeliveryForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/deliveries/formulario/:id',
    name: 'DeliveryFormEdit',
    component: DeliveryForm,
    meta: { requiresAuth: true }
  },
  {
    path:'/fuel-consumption',
    name: 'Fuel',
    component: Fuel,
    meta: { requiresAuth: true }
  },
  {
    path: '/fuel-consumption/formulario',
    name: 'FuelForm',
    component: FuelForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/fuel-consumption/formulario/:id',
    name: 'FuelFormEdit',
    component: FuelForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: Maintenance,
    meta: { requiresAuth: true }
  },
  {
    path: '/maintenance/formulario',
    name: 'MaintenanceForm',
    component: MaintenanceForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/maintenance/formulario/:id',
    name: 'MaintenanceFormEdit',
    component: MaintenanceForm,
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
