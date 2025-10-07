<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const go = (path) => router.push(path)
</script>

<template>
  <div class="p-6">
    <h2 class="text-4xl font-bold mb-6">{{ t('dashboard.quickAccess') }}</h2>

    <div class="grid">
      <div class="col-12 md:col-4">
        <div class="card p-6 flex flex-column gap-4 hover-card">
          <div class="flex align-items-center gap-3">
            <i class="pi pi-users text-4xl text-blue-500"></i>
            <span class="text-2xl font-semibold">{{ t('navigation.users') }}</span>
          </div>
          <p class="text-gray-600 text-sm">{{ t('dashboard.usersDescription') }}</p>
          <pv-button :label="t('dashboard.goToUsers')" icon="pi pi-arrow-right" size="large" @click="go('/users')" />
        </div>
      </div>
      <div class="col-12 md:col-4">
        <div class="card p-6 flex flex-column gap-4 hover-card">
          <div class="flex align-items-center gap-3">
            <i class="pi pi-truck text-4xl text-green-500"></i>
            <span class="text-2xl font-semibold">{{ t('navigation.deliveries') }}</span>
          </div>
          <p class="text-gray-600 text-sm">{{ t('dashboard.deliveriesDescription') }}</p>
          <pv-button :label="t('dashboard.goToDeliveries')" icon="pi pi-arrow-right" size="large" @click="go('/deliveries')" />
        </div>
      </div>
      <div class="col-12 md:col-4">
        <div class="card p-6 flex flex-column gap-4 hover-card">
          <div class="flex align-items-center gap-3">
            <i class="pi pi-car text-4xl text-purple-500"></i>
            <span class="text-2xl font-semibold">{{ t('navigation.fleetManagement') }}</span>
          </div>
          <p class="text-gray-600 text-sm">{{ t('dashboard.fleetDescription') }}</p>
          <pv-button :label="t('dashboard.goToFleet')" icon="pi pi-arrow-right" size="large" @click="go('/fleet-management')" />
        </div>
      </div>
      <!-- <div class="col-12 md:col-4">
        <div class="card p-6 flex flex-column gap-4 hover-card">
          <div class="flex align-items-center gap-3">
            <i class="pi pi-gas-pump text-4xl text-orange-500"></i>
            <span class="text-2xl font-semibold">{{ t('navigation.fuelConsumption') }}</span>
          </div>
          <p class="text-gray-600 text-sm">{{ t('dashboard.fuelDescription') }}</p>
          <pv-button :label="t('dashboard.goToFuel')" icon="pi pi-arrow-right" size="large" @click="go('/fuel-consumption')" />
        </div>
      </div> -->
      <div class="col-12 md:col-4">
        <div class="card p-6 flex flex-column gap-4 hover-card">
          <div class="flex align-items-center gap-3">
            <i class="pi pi-chart-bar text-4xl text-indigo-500"></i>
            <span class="text-2xl font-semibold">{{ t('navigation.reports') }}</span>
          </div>
          <p class="text-gray-600 text-sm">{{ t('dashboard.reportsDescription') }}</p>
          <pv-button :label="t('dashboard.goToReports')" icon="pi pi-arrow-right" size="large" @click="go('/reports')" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos para hacer el dashboard más grande y atractivo */
.hover-card {
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 200px;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Aumentar el tamaño de los iconos */
.pi {
  font-size: 3rem !important;
}

/* Hacer las tarjetas más grandes */
.card {
  min-height: 220px;
  border-radius: 12px;
}

/* Estilos para el título principal */
h2 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

/* Espaciado mejorado */
.grid {
  gap: 1.5rem;
}

/* Estilos para los botones */
.p-button {
  font-size: 1.1rem;
  padding: 0.75rem 1.5rem;
}

/* Responsive para pantallas más pequeñas */
@media (max-width: 768px) {
  .pi {
    font-size: 2.5rem !important;
  }
  
  .card {
    min-height: 180px;
  }
  
  h2 {
    font-size: 2rem;
  }
}
</style>
