<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDeliveriesStore } from '../../application/deliveries.store.js'
import { useVehiclesStore } from '../../../fleet-management/application/vehicles.store.js'
import { useConductoresStore } from '../../../conductores/application/conductores.store.js'
import { ValidationService } from '../../../shared/infrastructure/validation.service.js'
import { useConfirm } from 'primevue/useconfirm'

const { t } = useI18n()

const router = useRouter()
const store = useDeliveriesStore()
const vehiclesStore = useVehiclesStore()
const conductoresStore = useConductoresStore()

const confirm = useConfirm()

const dialogVisible = ref(false)
const editMode = ref(false)
const form = ref({ 
  code: '',
  customerName: '',
  address: '',
  originProvince: '',
  destinationProvince: '',
  scheduledAt: '',
  status: 'pending',
  driverName: '',
  vehiclePlate: '',
  distanceKm: null,
  etaMinutes: null
})
const formErrors = ref({})

const validationRules = {
  code: [ { required: true, message: t('forms.validation.codeRequired') } ],
  customerName: [ { required: true, message: t('forms.validation.customerNameRequired') }, { minLength: 3, message: t('forms.validation.customerNameMinLength') } ],
  address: [ { required: true, message: t('forms.validation.addressRequired') } ],
}

const validateForm = () => {
  const validation = ValidationService.validateForm(form.value, validationRules)
  formErrors.value = validation.errors
  return validation.isValid
}

// Computed properties for assigned drivers and vehicles
const assignedDrivers = computed(() => {
  return (vehiclesStore.vehicles || [])
    .filter(v => (v.current_driver || v.currentDriver) && (v.status === 'available' || v.status === 'in_use'))
    .map(v => ({
      label: `${v.current_driver || v.currentDriver} - ${v.license_plate || v.licensePlate}`,
      value: v.current_driver || v.currentDriver,
      vehiclePlate: v.license_plate || v.licensePlate
    }))
})

const assignedVehicles = computed(() => {
  return (vehiclesStore.vehicles || [])
    .filter(v => (v.current_driver || v.currentDriver) && (v.status === 'available' || v.status === 'in_use'))
    .map(v => ({
      label: `${v.license_plate || v.licensePlate} - ${v.current_driver || v.currentDriver}`,
      value: v.license_plate || v.licensePlate,
      driverName: v.current_driver || v.currentDriver
    }))
})

// Helper to resolve driver from vehicle when delivery lacks driverName
const resolveDriverName = (delivery) => {
  if (!delivery) return ''
  if (delivery.driverName) return delivery.driverName
  const plate = delivery.vehiclePlate
  if (!plate) return ''
  const vehicles = vehiclesStore.vehicles || []
  const v = vehicles.find(vh => (vh.license_plate || vh.licensePlate) === plate)
  return v?.current_driver || v?.currentDriver || ''
}

// Functions to sync driver and vehicle selection
const onDriverChange = (driverName) => {
  const driverAssignment = assignedDrivers.value.find(d => d.value === driverName)
  if (driverAssignment) {
    form.value.vehiclePlate = driverAssignment.vehiclePlate
  }
}

const onVehicleChange = (vehiclePlate) => {
  const vehicleAssignment = assignedVehicles.value.find(v => v.value === vehiclePlate)
  if (vehicleAssignment) {
    form.value.driverName = vehicleAssignment.driverName
  }
}

// Function to calculate fuel consumption based on distance (for display purposes only)
const calculateFuelConsumption = (distanceKm) => {
  if (!distanceKm || distanceKm <= 0) return '0.0'
  
  // Valores de referencia para diferentes tipos de vehículos
  const fuelConsumptionRates = {
    // Camiones pequeños (3-5 toneladas): 15-20 L/100km
    small: 18,
    // Camiones medianos (5-10 toneladas): 20-25 L/100km  
    medium: 22,
    // Camiones grandes (10+ toneladas): 25-35 L/100km
    large: 30,
    // Promedio general para camiones de carga
    average: 25
  }
  
  // Usar el promedio general para cálculos estándar
  const consumptionPer100km = fuelConsumptionRates.average
  const fuelNeeded = (distanceKm * consumptionPer100km) / 100
  
  return fuelNeeded.toFixed(1)
}

const openNew = () => {
  router.push('/deliveries/formulario')
}

const openEdit = (delivery) => {
  router.push(`/deliveries/formulario/${delivery.id}`)
}

const confirmDelete = (delivery) => {
  confirm.require({
    message: t('deliveries.confirmDelete', { code: delivery.code }),
    header: t('deliveries.confirmDeleteHeader'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => store.deleteDelivery(delivery.id)
  })
}


const save = async () => {
  if (!validateForm()) return
  
  try {
    const payload = { ...form.value }
    if (payload.etaMinutes != null) {
      payload.etaMinutes = Math.round(Number(payload.etaMinutes) * 60)
    }
    
    if (editMode.value) {
      await store.updateDelivery(payload)
    } else {
      await store.addDelivery(payload)
    }
    
    dialogVisible.value = false
  } catch (error) {
    // Error is already handled by the store and notification service
    // Just log it for debugging purposes
    console.error('Error saving delivery:', error)
  }
}

onMounted(() => {
  store.fetchDeliveries()
  vehiclesStore.fetchVehicles()
  conductoresStore.fetchConductores()
})
</script>

<template>
  <div class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="text-2xl font-bold">{{ t('deliveries.title') }}</h2>
      <pv-button :label="t('deliveries.newDelivery')" icon="pi pi-plus" @click="openNew" />
    </div>


    <div class="card">
      <pv-data-table :value="store.filteredDeliveries" :loading="store.loading" paginator :rows="10" :rows-per-page-options="[5,10,20]">
        <pv-column field="code" :header="t('deliveries.table.code')" sortable />
        
        <pv-column field="originProvince" :header="t('deliveries.table.origin')" />
        <pv-column field="destinationProvince" :header="t('deliveries.table.destination')" />
        <pv-column field="driverName" :header="t('deliveries.table.driver')">
          <template #body="{ data }">
            <div v-if="(data.driverName || resolveDriverName(data))" class="flex align-items-center gap-2">
              <i class="pi pi-user text-gray-400"></i>
              <span>{{ data.driverName || resolveDriverName(data) }}</span>
            </div>
            <div v-else class="flex align-items-center gap-2 text-gray-400">
              <i class="pi pi-user-slash"></i>
              <span>{{ t('deliveries.unassigned') }}</span>
            </div>
          </template>
        </pv-column>
        <pv-column field="vehiclePlate" :header="t('deliveries.table.vehicle')">
          <template #body="{ data }">
            <div v-if="data.vehiclePlate" class="flex align-items-center gap-2">
              <i class="pi pi-car text-blue-500"></i>
              <span>{{ data.vehiclePlate }}</span>
            </div>
            <div v-else class="flex align-items-center gap-2 text-gray-400">
              <i class="pi pi-car-slash"></i>
              <span>{{ t('deliveries.unassigned') }}</span>
            </div>
          </template>
        </pv-column>
        <pv-column field="distanceKm" :header="t('deliveries.table.distance')" />
        <pv-column field="etaMinutes" :header="t('deliveries.table.eta')">
          <template #body="{ data }">
            <span v-if="data.etaMinutes != null">{{ (data.etaMinutes / 60).toFixed(1) }} h</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </pv-column>
        <pv-column field="status" :header="t('deliveries.table.status')" sortable />
        <pv-column :header="t('common.actions')" :style="{ width: '150px' }">
          <template #body="{ data }">
            <div class="flex gap-1">
              <pv-button icon="pi pi-pencil" size="small" text rounded severity="info" @click="openEdit(data)" v-tooltip.top="t('common.edit')" />
              <pv-button icon="pi pi-trash" size="small" text rounded severity="danger" @click="confirmDelete(data)" v-tooltip.top="t('common.delete')" />
            </div>
          </template>
        </pv-column>
      </pv-data-table>
    </div>

    <pv-dialog v-model:visible="dialogVisible" modal :header="editMode ? t('forms.delivery.editDelivery') : t('forms.delivery.newDelivery')" :style="{ width: '500px' }" :closable="false">
      <div class="flex flex-column gap-3">
        <pv-float-label>
          <pv-input-text id="code" v-model="form.code" class="w-full" :class="{ 'p-invalid': formErrors.code }" />
          <label for="code">{{ t('forms.delivery.deliveryCode') }} *</label>
        </pv-float-label>
        <small v-if="formErrors.code" class="p-error">{{ formErrors.code }}</small>

        <pv-float-label>
          <pv-input-text id="customerName" v-model="form.customerName" class="w-full" :class="{ 'p-invalid': formErrors.customerName }" />
          <label for="customerName">{{ t('forms.delivery.customerName') }} *</label>
        </pv-float-label>
        <small v-if="formErrors.customerName" class="p-error">{{ formErrors.customerName }}</small>

        <pv-float-label>
          <pv-input-text id="address" v-model="form.address" class="w-full" :class="{ 'p-invalid': formErrors.address }" />
          <label for="address">{{ t('forms.delivery.address') }} *</label>
        </pv-float-label>
        <small v-if="formErrors.address" class="p-error">{{ formErrors.address }}</small>

        <div class="grid">
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-text id="originProvince" v-model="form.originProvince" class="w-full" />
              <label for="originProvince">{{ t('forms.delivery.originProvince') }}</label>
            </pv-float-label>
          </div>
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-text id="destinationProvince" v-model="form.destinationProvince" class="w-full" />
              <label for="destinationProvince">{{ t('forms.delivery.destinationProvince') }}</label>
            </pv-float-label>
          </div>
        </div>

        <div class="grid">
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-number id="distanceKm" v-model="form.distanceKm" class="w-full" :min="0" :max="10000" />
              <label for="distanceKm">{{ t('forms.delivery.distance') }}</label>
            </pv-float-label>
          </div>
        </div>

        <div class="grid">
          <div class="col-12">
            <pv-select 
              v-model="form.vehiclePlate" 
              :options="assignedVehicles" 
              option-label="label" 
              option-value="value" 
              class="w-full" 
              :placeholder="t('deliveries.assignedVehicle')" 
              @change="onVehicleChange"
              :disabled="assignedVehicles.length === 0"
            />
            <small v-if="assignedVehicles.length === 0" class="text-orange-500 block">
              ⚠️ {{ t('deliveries.noVehiclesWithDrivers') }}
            </small>
          </div>
        </div>

        <pv-float-label>
          <pv-input-number id="eta" v-model="form.etaMinutes" class="w-full" />
          <label for="eta">{{ t('forms.delivery.eta') }}</label>
        </pv-float-label>
      </div>

      <template #footer>
        <div class="flex justify-content-end gap-2">
          <pv-button :label="t('common.cancel')" severity="secondary" text @click="dialogVisible = false" />
          <pv-button :label="t('common.save')" icon="pi pi-save" @click="save" />
        </div>
      </template>
    </pv-dialog>

    <!-- Confirm Dialog -->
    <pv-confirm-dialog />
  </div>
</template>

<style scoped>
/* Estilos seguros para el header de la tabla */
:deep(.p-datatable-header) {
  color: #374151;
  background-color: #f8fafc;
}

/* Estilos para las celdas del header */
:deep(.p-datatable-header th) {
  color: #374151;
  background-color: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

/* Estilos para el texto del header */
:deep(.p-datatable-header th span) {
  color: #374151;
  font-weight: 600;
}
</style>
