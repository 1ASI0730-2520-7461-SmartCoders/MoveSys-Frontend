<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle', 'navigate'])

const route = useRoute()

const menuItems = computed(() => [
  {
    label: t('navigation.dashboard'),
    icon: 'pi pi-home',
    route: '/dashboard'
  },
  {
    label: t('navigation.deliveries'),
    icon: 'pi pi-truck',
    route: '/deliveries'
  },
  {
    label: t('navigation.users'),
    icon: 'pi pi-users',
    route: '/users'
  },
  {
    label: t('navigation.fleetManagement'),
    icon: 'pi pi-car',
    route: '/fleet-management'
  },
  {
    label: t('navigation.fuelConsumption'),
    icon: 'pi pi-bolt',
    route: '/fuel-consumption'
  },
  {
    label: t('navigation.maintenance'),
    icon: 'pi pi-wrench',
    route: '/maintenance'
  },
  {
    label: t('navigation.reports'),
    icon: 'pi pi-chart-bar',
    route: '/reports'
  }
])

const menuModel = ref([
  {
    label: t('navigation.dashboard'),
    icon: 'pi pi-home',
    command: () => navigateTo('/dashboard'),
    class: () => route.path === '/dashboard' ? 'active-menu-item' : '',
    style: () => route.path === '/dashboard' ? 'background: rgba(99, 102, 241, 0.23); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); color: rgba(43, 47, 48, 0.9);' : ''
  },
  {
    label: t('navigation.deliveries'),
    icon: 'pi pi-truck',
    command: () => navigateTo('/deliveries'),
    class: () => route.path === '/deliveries' ? 'active-menu-item' : '',
    style: () => route.path === '/deliveries' ? 'background: rgba(99, 102, 241, 0.23); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); color: rgba(43, 47, 48, 0.9);' : ''
  },
  {
    label: t('navigation.users'),
    icon: 'pi pi-users',
    command: () => navigateTo('/users'),
    class: () => route.path === '/users' ? 'active-menu-item' : '',
    style: () => route.path === '/users' ? 'background: rgba(99, 102, 241, 0.23); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); color: rgba(43, 47, 48, 0.9);' : ''
  },
  {
    label: t('navigation.fleetManagement'),
    icon: 'pi pi-car',
    command: () => navigateTo('/fleet-management'),
    class: () => route.path === '/fleet-management' ? 'active-menu-item' : '',
    style: () => route.path === '/fleet-management' ? 'background: rgba(99, 102, 241, 0.23); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); color: rgba(43, 47, 48, 0.9);' : ''
  },
  {
    label: t('navigation.fuelConsumption'),
    icon: 'pi pi-fire',
    command: () => navigateTo('/fuel-consumption'),
    class: () => route.path === '/fuel-consumption' ? 'active-menu-item' : '',
    style: () => route.path === '/fuel-consumption' ? 'background: rgba(99, 102, 241, 0.23); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); color: rgba(43, 47, 48, 0.9);' : ''
  },
  {
    label: 'Mantenimiento',
    icon: 'pi pi-wrench',
    command: () => navigateTo('/maintenance'),
    class: () => route.path === '/maintenance' ? 'active-menu-item' : '',
    style: () => route.path === '/maintenance' ? 'background: rgba(99, 102, 241, 0.23); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); color: rgba(43, 47, 48, 0.9);' : ''
  },
  {
    label: t('navigation.reports'),
    icon: 'pi pi-chart-bar',
    command: () => navigateTo('/reports'),
    class: () => route.path === '/reports' ? 'active-menu-item' : '',
    style: () => route.path === '/reports' ? 'background: rgba(99, 102, 241, 0.23); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); color: rgba(43, 47, 48, 0.9);' : ''
  }
])

const navigateTo = (routePath) => {
  emit('navigate', routePath)
}

const isActiveRoute = (routePath) => {
  return route.path === routePath
}

const handleLogout = () => {
  localStorage.removeItem('movesys_token')
  localStorage.removeItem('movesys_user')
  
  emit('navigate', '/login')
}
</script>


<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Logo -->
    <div class="sidebar-header">
      <div class="logo">
        <img src="/images/rt.png" alt="Logo MoveSys" class="img-logo"/>
      </div>
    </div>
    
    <!-- Navigation Menu -->
    <nav class="sidebar-nav">
      <!-- Versión con botones -->
      <div class="button-navigation" :class="{ collapsed: isCollapsed }">
        <pv-button
          v-for="item in menuItems"
          :key="item.route"
          :label="isCollapsed ? '' : item.label"
          :icon="item.icon"
          :class="['nav-button', { active: isActiveRoute(item.route) }]"
          text
          @click="navigateTo(item.route)"
          :title="isCollapsed ? item.label : ''"
        />
      </div>

    </nav>
    
    <!-- Logout Button -->
    <div class="sidebar-footer">
      <pv-button
        :label="isCollapsed ? '' : t('navigation.logout')"
        icon="pi pi-sign-out"
        severity="danger"
        text
        @click="handleLogout"
        class="logout-button"
        :title="isCollapsed ? t('navigation.logout') : ''"
      />
    </div>
  </aside>
</template>



<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, #f1f3f6 0%, #ffffff 100%);
  color: white;
  transition: width 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.img-logo{
  margin-left: 70px;
  margin-top: 40px;
  height: 45px;
  width: 130px;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
}

/* Estilos para la navegación con botones */
.button-navigation {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 20px;
}

.button-navigation.collapsed {
  padding: 0 20px;
}

.nav-button {
  width: 100%;
  justify-content: flex-start !important;
  padding: 12px 16px !important;
  margin: 4px 0 !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
  color: rgba(43, 47, 48, 0.74) !important;
  font-weight: 500 !important;
  font-size: 14px !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: rgba(43, 47, 48, 0.9) !important;
  transform: translateX(4px);
}

.nav-button.active {
  background: rgba(99, 102, 241, 0.23) !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
  color: rgba(43, 47, 48, 0.9) !important;
}

.nav-button.collapsed {
  justify-content: center !important;
  padding: 12px !important;
}

.nav-button .p-button-icon {
  font-size: 18px;
  margin-right: 12px;
}

.nav-button.collapsed .p-button-icon {
  margin-right: 0;
}

.nav-button .p-button-label {
  font-weight: 500;
  font-size: 14px;
}

:deep(.sidebar-menu) {
  background: transparent;
  border: none;
  width: 100%;
}

:deep(.sidebar-menu .p-menu-list) {
  padding: 0;
  margin: 0;
  list-style: none;
}

:deep(.sidebar-menu .p-menuitem) {
  margin: 0 20px 0 20px;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

:deep(.sidebar-menu .p-menuitem-link) {
  padding: 12px;
  border-radius: 8px;
  color: rgba(43, 47, 48, 0.74);
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  margin: 20px 20px;
}

:deep(.sidebar-menu .p-menuitem-link:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(43, 47, 48, 0.9);
}

:deep(.sidebar-menu .p-menuitem-link.p-menuitem-link-active) {
  background: rgba(99, 102, 241, 0.23) !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
  color: rgba(43, 47, 48, 0.9) !important;
}

:deep(.sidebar-menu .p-menuitem-link.active-menu-item) {
  background: rgba(99, 102, 241, 0.23) !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
  color: rgba(43, 47, 48, 0.9) !important;
}

/* Forzar colores personalizados */
:deep(.sidebar-menu .p-menuitem-link[style*="background: rgba(99, 102, 241, 0.23)"]) {
  background: rgba(99, 102, 241, 0.23) !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
  color: rgba(43, 47, 48, 0.9) !important;
}

/* Aplicar color morado a todos los elementos con clase active-menu-item */
:deep(.active-menu-item) {
  background: rgba(99, 102, 241, 0.23) !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
  color: rgba(43, 47, 48, 0.9) !important;
}

:deep(.sidebar-menu .p-menuitem-icon) {
  font-size: 18px;
  width: 20px;
  text-align: center;
  color: rgba(43, 47, 48, 0.74);
}

:deep(.sidebar-menu .p-menuitem-text) {
  font-weight: 500;
  font-size: 14px;
  color: rgba(43, 47, 48, 0.74);
}



/* Estilos específicos para elementos activos */
:deep(.sidebar-menu .p-menuitem-link.active-menu-item .p-menuitem-icon) {
  color: rgba(43, 47, 48, 0.9) !important;
}

:deep(.sidebar-menu .p-menuitem-link.active-menu-item .p-menuitem-text) {
  color: rgba(43, 47, 48, 0.9) !important;
}

/* Forzar colores en todos los estados */
:deep(.sidebar-menu .p-menuitem-link) {
  background: transparent !important;
}

:deep(.sidebar-menu .p-menuitem-link:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: rgba(43, 47, 48, 0.9) !important;
}

:deep(.sidebar-menu .p-menuitem-link.active-menu-item) {
  background: rgba(99, 102, 241, 0.23) !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
  color: rgba(43, 47, 48, 0.9) !important;
}

/* Collapsed state */
:deep(.sidebar-menu.collapsed .p-menuitem-text) {
  display: none;
}

:deep(.sidebar-menu.collapsed .p-menuitem-link) {
  justify-content: center;
  padding: 12px;
  margin: 20px 20px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.logout-button) {
  width: 100%;
  background: rgba(209, 18, 18, 0.49) !important;
  border: none !important;
  border-radius: 8px;
  padding: 12px;
  color: #2b2f30 !important;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: none !important;
}

:deep(.logout-button:hover) {
  background: rgba(220, 38, 38, 0.66) !important;
  color: #0ab2dc !important;
}

:deep(.logout-button:focus) {
  background: rgba(209, 18, 18, 0.49) !important;
  color: #21aed1 !important;
  box-shadow: none !important;
}

:deep(.logout-button .p-button-icon) {
  font-size: 16px;

}

:deep(.logout-button .p-button-label) {
  font-size: 14px;
  color: #1f2937 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .sidebar.collapsed {
    width: 100%;
  }
}
</style>
