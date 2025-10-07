<script setup lang="js">
import { onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDeliveriesStore } from '../../../delivery-management/application/deliveries.store.js'
import { useVehiclesStore } from '../../../fleet-management/application/vehicles.store.js'
import { useFuelStore } from '../../../fuel-consumption/application/fuel.store.js'

const { t } = useI18n()

const deliveriesStore = useDeliveriesStore()
const vehiclesStore = useVehiclesStore()
const fuelStore = useFuelStore()

// Local state (minimal filters)
const searchPlate = ref('')
const searchDriver = ref('')

// Load data
onMounted(() => {
  if (!deliveriesStore.deliveries?.length) deliveriesStore.fetchDeliveries()
  if (!vehiclesStore.vehicles?.length) vehiclesStore.fetchVehicles()
  if (!fuelStore.entries?.length) fuelStore.fetchEntries()
})

// Fuel KPIs
const totalLiters = computed(() => (fuelStore.entries || []).reduce((acc, e) => acc + (Number(e.liters) || 0), 0))
const totalFuelCost = computed(() => (fuelStore.entries || []).reduce((acc, e) => acc + (Number(e.cost) || 0), 0))
const avgCostPerLiter = computed(() => totalLiters.value ? (totalFuelCost.value / totalLiters.value) : 0)

// Operations KPIs
const totalDistanceKm = computed(() => (deliveriesStore.deliveries || []).reduce((acc, d) => acc + (Number(d.distanceKm || d.distance_km) || 0), 0))
const deliveriesCount = computed(() => deliveriesStore.deliveries?.length || 0)
const deliveriesCompleted = computed(() => (deliveriesStore.deliveries || []).filter(d => d.status === 'completed').length)
const estimatedLPer100 = computed(() => totalDistanceKm.value ? (totalLiters.value / totalDistanceKm.value) * 100 : 0)

// Vehicle ranking (fuel consumed)
const fuelByVehicle = computed(() => {
  const map = new Map()
  for (const e of (fuelStore.entries || [])) {
    const plate = e.vehiclePlate || 'N/D'
    const prev = map.get(plate) || { vehiclePlate: plate, liters: 0, cost: 0 }
    prev.liters += Number(e.liters) || 0
    prev.cost += Number(e.cost) || 0
    map.set(plate, prev)
  }
  let arr = Array.from(map.values())
  if (searchPlate.value) {
    const q = searchPlate.value.toLowerCase()
    arr = arr.filter(v => (v.vehiclePlate || '').toLowerCase().includes(q))
  }
  return arr.sort((a, b) => b.liters - a.liters)
})

// Deliveries table with driver/vehicle for simple cross-references
const deliveriesTable = computed(() => {
  const vehicles = vehiclesStore.vehicles || []
  const driverByPlate = new Map(vehicles.map(v => [v.licensePlate || v.license_plate, v.currentDriver || v.current_driver]))
  return (deliveriesStore.deliveries || []).map(d => ({
    code: d.code,
    origin: d.originProvince || d.origin_province,
    destination: d.destinationProvince || d.destination_province,
    vehiclePlate: d.vehiclePlate || d.vehicle_plate,
    driverName: d.driverName || driverByPlate.get(d.vehiclePlate || d.vehicle_plate) || '',
    distanceKm: d.distanceKm || d.distance_km || 0,
    status: d.status
  }))
})

// Function to calculate estimated fuel consumption
const calculateFuelConsumption = (distanceKm) => {
  // Average estimation: 25 L/100km for cargo trucks
  const avgConsumptionPer100km = 25
  const fuelNeeded = (distanceKm * avgConsumptionPer100km) / 100
  return fuelNeeded.toFixed(1)
}
</script>

<template>
  <div class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="text-2xl font-bold">{{ t('reports.title') }}</h2>
    </div>



    <!-- Delivery Summary -->
    <pv-card>
      <template #title>{{ t('reports.deliverySummary') }}</template>
      <template #content>
        <pv-data-table 
          :value="deliveriesTable" 
          :loading="deliveriesStore.loading"
          paginator 
          :rows="10" 
          :rows-per-page-options="[5,10,20]"
          :empty-message="t('reports.noDeliveries')"
        >
          <pv-column field="code" :header="t('reports.table.code')" sortable />
          <pv-column field="driverName" :header="t('reports.table.driver')">
            <template #body="{ data }">
              <div v-if="data.driverName" class="flex align-items-center gap-2">
                <i class="pi pi-user text-green-500"></i>
                <span>{{ data.driverName }}</span>
              </div>
              <div v-else class="flex align-items-center gap-2 text-gray-400">
                <i class="pi pi-user-slash"></i>
                <span>{{ t('reports.unassigned') }}</span>
              </div>
            </template>
          </pv-column>
          <pv-column field="vehiclePlate" :header="t('reports.table.vehicle')">
            <template #body="{ data }">
              <div v-if="data.vehiclePlate" class="flex align-items-center gap-2">
                <i class="pi pi-car text-blue-500"></i>
                <span>{{ data.vehiclePlate }}</span>
              </div>
              <div v-else class="flex align-items-center gap-2 text-gray-400">
                <i class="pi pi-car-slash"></i>
                <span>{{ t('reports.unassigned') }}</span>
              </div>
            </template>
          </pv-column>
          <pv-column field="distanceKm" :header="t('reports.table.distance')" sortable>
            <template #body="{ data }">
              {{ (data.distanceKm || 0).toFixed(0) }} km
            </template>
          </pv-column>
          <pv-column field="status" :header="t('reports.table.status')" sortable>
            <template #body="{ data }">
              <pv-tag 
                :value="data.status" 
                :severity="data.status === 'completed' ? 'success' : data.status === 'pending' ? 'warning' : 'info'"
              />
            </template>
          </pv-column>
        </pv-data-table>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
/* Estilos específicos para el tema oscuro si es necesario */
.h-full {
  height: 100%;
}
</style>
