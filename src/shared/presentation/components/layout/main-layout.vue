<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from './sidebar.vue'
import Header from './header.vue'

const router = useRouter()
const sidebarCollapsed = ref(false)
const currentUser = ref(null)
const notificationsCount = ref(65)

onMounted(() => {
  const userData = localStorage.getItem('movesys_user')
  if (userData) {
    currentUser.value = JSON.parse(userData)
  }
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const handleNavigation = (route) => {
  router.push(route)
}

const handleLogout = () => {
  localStorage.removeItem('movesys_token')
  localStorage.removeItem('movesys_user')

  router.push('/login')
}
</script>

<template>
  <div class="main-layout">
    <!-- Sidebar -->
    <Sidebar 
      :is-collapsed="sidebarCollapsed"
      @toggle="toggleSidebar"
      @navigate="handleNavigation"
    />
    
    <!-- Main Content Area -->
    <div class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- Header -->
      <Header 
        :current-user="currentUser"
        :notifications-count="notificationsCount"
        @logout="handleLogout"
        @toggle-sidebar="toggleSidebar"
      />
      
      <!-- Page Content -->
      <main class="page-content">
        <router-view />
      </main>
    </div>
  </div>
</template>



<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
  margin-left: 280px;
}

.main-content.sidebar-collapsed {
  margin-left: 80px;
}

.page-content {
  flex: 1;
  padding: 0;
  background-color: #f8fafc;
  margin: 0;
  border-radius: 0;
  box-shadow: none;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .main-content.sidebar-collapsed {
    margin-left: 0;
  }
  
  .page-content {
    margin: 0.5rem;
    padding: 1rem;
  }
}
</style>
