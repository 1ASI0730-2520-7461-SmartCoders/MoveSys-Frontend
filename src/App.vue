<template>
  <div id="app">
    <pv-toast />
    <!-- Use main layout for authenticated routes (exclude login/register) -->
    <!-- El router guard maneja las redirecciones, aquí solo decidimos qué layout mostrar -->
    <MainLayout v-if="showMainLayout" />
    <!-- Use simple layout for auth pages -->
    <router-view v-else />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { notificationService } from './shared/infrastructure/notification.service.js'
import { useRoute } from 'vue-router'
import MainLayout from './shared/presentation/components/layout/main-layout.vue'

const route = useRoute()

// Verificar si debemos mostrar el MainLayout
// Solo lo mostramos si NO estamos en login/register y hay un token válido
const showMainLayout = computed(() => {
  const isAuthPage = route.path === '/login' || route.path === '/register'
  
  if (isAuthPage) {
    return false // Nunca mostrar MainLayout en login/register
  }
  
  // Si no es página de auth, verificar token
  const token = localStorage.getItem('movesys_token')
  const hasValidToken = token !== null && token !== '' && token !== 'dev-token-123'
  
  return hasValidToken
})

onMounted(() => {
  // Initialize app
  console.log('MoveSys Frontend App initialized')
  // Wire toast instance
  const toast = useToast()
  notificationService.setToastInstance(toast)
  
  // Limpiar tokens inválidos o de desarrollo
  const token = localStorage.getItem('movesys_token')
  if (token === 'dev-token-123' || token === '' || token === null) {
    localStorage.removeItem('movesys_token')
    localStorage.removeItem('movesys_user')
    console.log('🧹 Token inválido eliminado')
  }
})
</script>

<style>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8fafc;
  color: #1f2937;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
}

/* PrimeVue Theme Customization */
.p-component {
  font-family: inherit;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>