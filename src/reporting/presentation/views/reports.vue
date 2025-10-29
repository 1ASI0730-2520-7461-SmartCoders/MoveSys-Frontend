<script setup lang="js">
import { onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDeliveriesStore } from '../../../delivery-management/application/deliveries.store.js'
import { useVehiclesStore } from '../../../fleet-management/application/vehicles.store.js'
import { useFuelStore } from '../../../fuel-consumption/application/fuel.store.js'
import { useMaintenanceStore } from '../../../maintenance-management/application/maintenance.store.js'
import { useUsersStore } from '../../../ user-management/application/users.store.js'

const { t } = useI18n()

const deliveriesStore = useDeliveriesStore()
const vehiclesStore = useVehiclesStore()
const fuelStore = useFuelStore()
const maintenanceStore = useMaintenanceStore()
const usersStore = useUsersStore()

// Load all data
onMounted(() => {
  if (!deliveriesStore.deliveries?.length) deliveriesStore.fetchDeliveries()
  if (!vehiclesStore.vehicles?.length) vehiclesStore.fetchVehicles()
  if (!fuelStore.entries?.length) fuelStore.fetchEntries()
  if (!maintenanceStore.records?.length) maintenanceStore.fetchRecords()
  if (!usersStore.users?.length) usersStore.fetchUsers()
})

// Create unified report with all related information
const unifiedReport = computed(() => {
  const deliveries = deliveriesStore.deliveries || []
  const vehicles = vehiclesStore.vehicles || []
  const fuelEntries = fuelStore.entries || []
  const maintenanceRecords = maintenanceStore.records || []
  
  return deliveries.map(delivery => {
    const vehiclePlate = delivery.vehiclePlate || delivery.vehicle_plate || ''
    const vehicle = vehicles.find(v => 
      (v.licensePlate || v.license_plate) === vehiclePlate
    )
    
    // Get driver information
    const driverName = delivery.driverName || vehicle?.currentDriver || vehicle?.current_driver || 'N/A'
    const driverInfo = usersStore.users?.find(u => u.fullName === driverName) || {}
    
    // Get fuel entries for this vehicle
    const fuelData = fuelEntries.filter(e => {
      const plate = e.vehiclePlate || e.vehicle_plate || ''
      return plate === vehiclePlate
    })
    const totalFuelLiters = fuelData.reduce((sum, e) => sum + (Number(e.liters) || 0), 0)
    const totalFuelCost = fuelData.reduce((sum, e) => {
      const cost = Number(e.totalPaid) || Number(e.total_paid) || 0
      return sum + cost
    }, 0)
    
    // Get maintenance records for this vehicle
    const maintenanceData = maintenanceRecords.filter(m => {
      const plate = m.vehiclePlate || m.vehicle_plate || ''
      return plate === vehiclePlate
    })
    const totalMaintenanceCost = maintenanceData.reduce((sum, m) => sum + (Number(m.cost) || 0), 0)
    
    return {
      // Delivery info
      code: delivery.code || 'N/A',
      customerName: delivery.customerName || 'N/A',
      originProvince: delivery.originProvince || delivery.origin_province || 'N/A',
      destinationProvince: delivery.destinationProvince || delivery.destination_province || 'N/A',
      distanceKm: delivery.distanceKm || delivery.distance_km || 0,
      status: delivery.status || 'pending',
      
      // Vehicle info
      vehiclePlate: vehiclePlate || 'N/A',
      vehicleModel: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'N/A',
      vehicleMileage: vehicle?.mileage || 0,
      vehicleStatus: vehicle?.status || 'N/A',
      
      // Driver info
      driverName: driverName,
      driverDni: driverInfo.dni || 'N/A',
      driverPhone: driverInfo.phoneNumber || 'N/A',
      
      // Fuel info
      totalFuelLiters: totalFuelLiters,
      totalFuelCost: totalFuelCost,
      fuelEntriesCount: fuelData.length,
      
      // Maintenance info
      totalMaintenanceCost: totalMaintenanceCost,
      maintenanceCount: maintenanceData.length
    }
  })
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
          :value="unifiedReport" 
          :loading="deliveriesStore.loading || vehiclesStore.loading || fuelStore.loading || maintenanceStore.loading"
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
                <div>
                  <div class="font-semibold">{{ data.vehiclePlate }}</div>
                  <div class="text-xs text-gray-500">{{ data.vehicleModel }}</div>
                </div>
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
                <div>
                  <div class="font-semibold">{{ data.driverName }}</div>
                  <div class="text-xs text-gray-500">DNI: {{ data.driverDni }}</div>
                </div>
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
