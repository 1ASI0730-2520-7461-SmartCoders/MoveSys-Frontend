<script setup>
import { ref, computed } from 'vue'
import LanguageSwitcher from '../navigation/language-switcher.vue'

const props = defineProps({
  currentUser: {
    type: Object,
    default: () => ({})
  },
  notificationsCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['logout'])

const showUserMenu = ref(false)
const defaultAvatar = '/images/default-user.svg'

const onLanguageChanged = (language) => {
  console.log('Idioma cambiado a:', language)
  // Aquí puedes agregar lógica adicional si es necesario
}

const openSettings = () => {
  console.log('Abrir configuración')
}

const openNotifications = () => {
  console.log('Abrir notificaciones')
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const openProfile = () => {
  console.log('Abrir perfil')
  showUserMenu.value = false
}

const handleLogout = () => {
  emit('logout')
  showUserMenu.value = false
}

// Cerrar menú al hacer clic fuera
import { onMounted, onUnmounted } from 'vue'

const handleClickOutside = (event) => {
  if (!event.target.closest('.user-profile')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>


<template>
  <header class="header">
    <div class="header-content">
      <!-- Left Side -->
      <div class="header-left">
        <h1 class="page-title">Centro de Control Operacional</h1>
      </div>
      
      <!-- Right Side -->
      <div class="header-right">
        <!-- Language Switcher -->
        <LanguageSwitcher @language-changed="onLanguageChanged" />


      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 2rem;
  height: 85px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}


.notifications-badge {
  position: relative;
}

.notification-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.icon-button {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.icon-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.user-profile {
  position: relative;
  cursor: pointer;
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
  transition: border-color 0.3s ease;
}

.user-profile:hover .profile-avatar {
  border-color: #6366f1;
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 1000;
  margin-top: 0.5rem;
}

.user-info {
  padding: 1rem;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.user-role {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0.5rem 0;
}

.menu-item {
  width: 100%;
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  transition: background-color 0.3s ease;
}

.menu-item:hover {
  background: #f9fafb;
}

.menu-item.logout-item {
  color: #ef4444;
}

.menu-item.logout-item:hover {
  background: #fef2f2;
}

.menu-item i {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .header {
    padding: 0 1rem;
  }
  
  .page-title {
    font-size: 1.25rem;
  }
  
  .header-right {
    gap: 0.5rem;
  }
  
  .language-button {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }
  
  .icon-button {
    font-size: 1rem;
    padding: 0.375rem;
  }
  
  .profile-avatar {
    width: 32px;
    height: 32px;
  }
}
</style>
