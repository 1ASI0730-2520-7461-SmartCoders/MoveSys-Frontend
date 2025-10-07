<template>
  <div id="app">
    <pv-toast />
    <!-- Use main layout for authenticated routes -->
    <MainLayout v-if="isAuthenticated" />
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

const isAuthenticated = computed(() => {
  const token = localStorage.getItem('movesys_token')
  const authenticated = token !== null && route.path !== '/login' && route.path !== '/register'
  
  console.log('🔍 App.vue - Estado de autenticación:', {
    token: token ? 'presente' : 'ausente',
    route: route.path,
    authenticated
  })
  
  return authenticated
})

onMounted(() => {
  // Initialize app
  console.log('MoveSys Frontend App initialized')
  // Wire toast instance
  const toast = useToast()
  notificationService.setToastInstance(toast)
  
  // Set temporary token for development
  if (!localStorage.getItem('movesys_token')) {
    localStorage.setItem('movesys_token', 'dev-token-123')
    localStorage.setItem('movesys_user', JSON.stringify({
      name: 'Developer User',
      email: 'dev@movesys.com',
      role: 'admin'
    }))
    console.log('🔑 Temporary token set for development')
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