<script setup lang="js">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useReportsStore } from '../../application/reports.store.js'

const { t } = useI18n()

const reportsStore = useReportsStore()

// Load report data from backend
onMounted(async () => {
  if (!reportsStore.unifiedReport?.length) {
    await reportsStore.fetchUnifiedReport()
  }
})
</script>

<template>
  <div class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="text-2xl font-bold">{{ t('reports.title') }}</h2>
    </div>

    <!-- Unified Report Table -->
    <pv-card>
      <template #title>
        <i class="pi pi-chart-line mr-2"></i>
        {{ t('reports.completeOperationsSummary') }}
      </template>
      <template #content>
        <pv-data-table 
          :value="reportsStore.unifiedReport" 
          :loading="reportsStore.loading"
          paginator 
          :rows="10" 
          :rows-per-page-options="[5,10,20,50]"
          scrollable
          scrollHeight="70vh"
          empty-message="No hay datos disponibles"
        >
          <!-- Entrega -->
          <pv-column field="code" :header="t('reports.table.deliveryCode')" sortable frozen>
            <template #body="{ data }">
              <span class="font-semibold text-blue-600">{{ data.code }}</span>
            </template>
          </pv-column>
          
          <pv-column field="customerName" :header="t('reports.table.client')" sortable />
          
          <pv-column field="originProvince" :header="t('reports.table.origin')" sortable />
          
          <pv-column field="destinationProvince" :header="t('reports.table.destination')" sortable />
          
          <pv-column field="distanceKm" :header="t('reports.table.distance')" sortable>
            <template #body="{ data }">
              <span class="font-semibold">{{ (data.distanceKm || 0).toFixed(0) }} km</span>
            </template>
          </pv-column>

          <!-- Vehículo -->
          <pv-column field="vehiclePlate" :header="t('reports.table.vehicleHeader')" sortable>
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-car text-blue-500"></i>
                <div class="font-semibold">{{ data.vehiclePlate }}</div>
              </div>
            </template>
          </pv-column>
          
          <pv-column field="vehicleMileage" :header="t('reports.table.mileage')" sortable>
            <template #body="{ data }">
              <i class="pi pi-gauge"></i> {{ (data.vehicleMileage || 0).toLocaleString() }} km
            </template>
          </pv-column>

          <!-- Conductor -->
          <pv-column field="driverName" :header="t('reports.table.driverHeader')" sortable>
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-user text-green-500"></i>
                <div class="font-semibold">{{ data.driverName }}</div>
              </div>
            </template>
          </pv-column>
          
          <pv-column field="driverPhone" :header="t('reports.table.driverPhone')" sortable>
            <template #body="{ data }">
              <i class="pi pi-phone"></i> {{ data.driverPhone }}
            </template>
          </pv-column>

          <!-- Combustible -->
          <pv-column field="totalFuelLiters" :header="t('reports.table.fuelLiters')" sortable>
            <template #body="{ data }">
              <div>
                <div class="flex align-items-center gap-1">
                  <i class="pi pi-slack text-orange-500"></i>
                  <span class="font-semibold">{{ (data.totalFuelLiters || 0).toFixed(1) }} L</span>
                </div>
              </div>
            </template>
          </pv-column>
          
          

          <!-- Mantenimiento -->
          <pv-column field="totalMaintenanceCost" :header="t('reports.table.maintenanceCost')" sortable>
            <template #body="{ data }">
              <span class="text-purple-600 font-semibold">S/. {{ (data.totalMaintenanceCost || 0).toLocaleString('es-PE') }}</span>
            </template>
          </pv-column>
          
          <pv-column field="maintenanceCount" :header="t('reports.table.maintenances')" sortable>
            <template #body="{ data }">
              <div class="flex align-items-center gap-1">
                <i class="pi pi-wrench text-purple-500"></i>
                <span>{{ data.maintenanceCount }}</span>
              </div>
            </template>
          </pv-column>
          
          <template #empty>
            <div class="text-center p-4">
              <i class="pi pi-inbox text-4xl text-gray-400 mb-3"></i>
              <p class="text-gray-500">{{ t('reports.noDeliveries') }}</p>
            </div>
          </template>
        </pv-data-table>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.h-full {
  height: 100%;
}
</style>
