<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '../../application/dashboard.store.js'
import PieChart from '../../../shared/presentation/components/charts/PieChart.vue'
import DoughnutChart from '../../../shared/presentation/components/charts/DoughnutChart.vue'
import BarChart from '../../../shared/presentation/components/charts/BarChart.vue'
import HorizontalBarChart from '../../../shared/presentation/components/charts/HorizontalBarChart.vue'

const router = useRouter()
const { t } = useI18n()
const dashboardStore = useDashboardStore()

onMounted(() => {
  dashboardStore.fetchAllData()
})

const go = (path) => router.push(path)
</script>

<template>
  <div class="p-4">
    <h1 class="text-3xl font-bold mb-6">{{ t('dashboard.title') }}</h1>

    <div v-if="dashboardStore.loading" class="flex justify-content-center align-items-center" style="min-height: 400px">
      <div class="text-center">
        <i class="pi pi-spin pi-spinner" style="font-size: 3rem"></i>
        <p class="mt-3">Cargando datos del dashboard...</p>
      </div>
    </div>

    <div v-else>
      <!-- Estadísticas Generales -->
      <div class="grid mb-4">
        <div class="col-12 md:col-3">
          <div class="stat-card">
            <div class="stat-icon blue">
              <i class="pi pi-truck"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ dashboardStore.stats.totalDeliveries }}</div>
              <div class="stat-label">Total Entregas</div>
              <div class="stat-sublabel">{{ dashboardStore.stats.pendingDeliveries }} pendientes</div>
            </div>
          </div>
        </div>
        <div class="col-12 md:col-3">
          <div class="stat-card">
            <div class="stat-icon green">
              <i class="pi pi-car"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ dashboardStore.stats.totalVehicles }}</div>
              <div class="stat-label">Total Vehículos</div>
              <div class="stat-sublabel">{{ dashboardStore.stats.activeVehicles }} activos</div>
            </div>
          </div>
        </div>
        <div class="col-12 md:col-3">
          <div class="stat-card">
            <div class="stat-icon purple">
              <i class="pi pi-users"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ dashboardStore.stats.totalConductores }}</div>
              <div class="stat-label">Total Conductores</div>
              <div class="stat-sublabel">{{ dashboardStore.stats.activeConductores }} activos</div>
            </div>
          </div>
        </div>
        <div class="col-12 md:col-3">
          <div class="stat-card">
            <div class="stat-icon orange">
              <i class="pi pi-wrench"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ dashboardStore.stats.totalMaintenance }}</div>
              <div class="stat-label">Mantenimientos</div>
              <div class="stat-sublabel">{{ dashboardStore.stats.totalFuelEntries }} registros de combustible</div>
      </div>
          </div>
        </div>
      </div>

      <!-- Gráficos con datos visuales -->
      <div class="grid mb-4">
        <!-- Gráfico de Entregas por Estado (Pie Chart) -->
        <div class="col-12 md:col-6">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">
                <i class="pi pi-chart-pie"></i>
                Entregas por Estado
              </h3>
            </div>
            <div class="chart-body">
              <PieChart 
                v-if="dashboardStore.deliveriesByStatus.labels.length > 0"
                :data="dashboardStore.deliveriesByStatus"
              />
              <div v-else class="no-data">
                <i class="pi pi-info-circle"></i>
                <p>No hay datos de entregas disponibles</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Gráfico de Vehículos por Estado (Bar Chart Vertical) -->
        <div class="col-12 md:col-6">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">
                <i class="pi pi-chart-bar"></i>
                Vehículos por Estado
              </h3>
            </div>
            <div class="chart-body">
              <BarChart 
                v-if="dashboardStore.vehiclesByStatus.labels.length > 0"
                :data="dashboardStore.vehiclesByStatus"
              />
              <div v-else class="no-data">
                <i class="pi pi-info-circle"></i>
                <p>No hay datos de vehículos disponibles</p>
              </div>
            </div>
          </div>
        </div>


        <!-- Gráfico de Mantenimientos por Tipo (Doughnut Chart) -->
        <div class="col-12 md:col-6">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">
                <i class="pi pi-chart-pie"></i>
                Mantenimientos por Tipo
              </h3>
            </div>
            <div class="chart-body">
              <DoughnutChart 
                v-if="dashboardStore.maintenanceByType.labels.length > 0"
                :data="dashboardStore.maintenanceByType"
              />
              <div v-else class="no-data">
                <i class="pi pi-info-circle"></i>
                <p>No hay datos de mantenimientos disponibles</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Costos de Combustible por Vehículo (Horizontal Bar Chart) -->
        <div class="col-12 md:col-6">
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">
                <i class="pi pi-dollar"></i>
                Costos de Combustible por Vehículo (Top 5)
              </h3>
            </div>
            <div class="chart-body">
              <HorizontalBarChart 
                v-if="dashboardStore.fuelCostByVehicle.labels.length > 0"
                :data="dashboardStore.fuelCostByVehicle"
              />
              <div v-else class="no-data">
                <i class="pi pi-info-circle"></i>
                <p>No hay datos de combustible disponibles</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Accesos Rápidos -->
      <div class="mt-4">
        <h2 class="text-2xl font-bold mb-4">{{ t('dashboard.quickAccess') }}</h2>
        <div class="grid">
      <div class="col-12 md:col-4">
            <div class="card p-4 flex flex-column gap-3 hover-card" @click="go('/conductores')">
          <div class="flex align-items-center gap-3">
                <i class="pi pi-users text-4xl text-blue-500"></i>
                <span class="text-xl font-semibold">{{ t('navigation.users') }}</span>
              </div>
              <p class="text-gray-600 text-sm">{{ t('dashboard.usersDescription') }}</p>
              <pv-button :label="t('dashboard.goToUsers')" icon="pi pi-arrow-right" size="small" />
            </div>
          </div>
          <div class="col-12 md:col-4">
            <div class="card p-4 flex flex-column gap-3 hover-card" @click="go('/deliveries')">
              <div class="flex align-items-center gap-3">
                <i class="pi pi-truck text-4xl text-green-500"></i>
                <span class="text-xl font-semibold">{{ t('navigation.deliveries') }}</span>
              </div>
              <p class="text-gray-600 text-sm">{{ t('dashboard.deliveriesDescription') }}</p>
              <pv-button :label="t('dashboard.goToDeliveries')" icon="pi pi-arrow-right" size="small" />
        </div>
      </div>
      <div class="col-12 md:col-4">
            <div class="card p-4 flex flex-column gap-3 hover-card" @click="go('/fleet-management')">
          <div class="flex align-items-center gap-3">
                <i class="pi pi-car text-4xl text-purple-500"></i>
                <span class="text-xl font-semibold">{{ t('navigation.fleetManagement') }}</span>
              </div>
              <p class="text-gray-600 text-sm">{{ t('dashboard.fleetDescription') }}</p>
              <pv-button :label="t('dashboard.goToFleet')" icon="pi pi-arrow-right" size="small" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.green {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.purple {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2d3748;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.25rem;
  font-weight: 500;
}

.stat-sublabel {
  font-size: 0.75rem;
  color: #a0aec0;
  margin-top: 0.25rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.chart-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8f9fa;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-title i {
  color: #667eea;
}

.chart-body {
  padding: 1.5rem;
}

.chart-data {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chart-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chart-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-label {
  font-size: 0.875rem;
  color: #4a5568;
  font-weight: 500;
}

.chart-value {
  font-size: 0.875rem;
  color: #2d3748;
  font-weight: 600;
}

.chart-bar-container {
  height: 24px;
  background: #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.chart-bar {
  height: 100%;
  border-radius: 12px;
  transition: width 0.3s ease;
  min-width: 4px;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #718096;
}

.no-data i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.hover-card {
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 150px;
}

.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.card {
  border-radius: 12px;
}

@media (max-width: 768px) {
  .stat-card {
    flex-direction: column;
    text-align: center;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
