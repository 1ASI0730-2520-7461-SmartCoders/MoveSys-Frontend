<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useVehiclesStore } from '../../application/vehicles.store.js'
import { useUsersStore } from '../../../ user-management/application/users.store.js'
import { useMaintenanceStore } from '../../../maintenance-management/application/maintenance.store.js'
import { ValidationService } from '../../../shared/infrastructure/validation.service.js'

const { t } = useI18n()

const router = useRouter()
const store = useVehiclesStore()
const usersStore = useUsersStore()
const maintenanceStore = useMaintenanceStore()

const vehiclesWithMaintenanceStatus = computed(() => {
  return store.filteredVehicles.map(vehicle => {
    const maintenanceInProgress = maintenanceStore.records.find(m => 
      m.vehiclePlate === vehicle.licensePlate && 
      m.status === 'in_progress'
    )
    
    if (maintenanceInProgress) {
      return {
        ...vehicle,
        status: 'maintenance',
        isInMaintenanceProgress: true
      }
    }
    
    if (vehicle.currentDriver && vehicle.currentDriver !== 'Unassigned' && vehicle.currentDriver !== 'null' && vehicle.currentDriver !== null) {
      return {
        ...vehicle,
        status: 'in_use',
        isInMaintenanceProgress: false
      }
    }
    
    return {
      ...vehicle,
      isInMaintenanceProgress: false
    }
  })
})

const dialogVisible = ref(false)
const editMode = ref(false)
const form = ref({
  licensePlate: '', brand: '', model: '', year: null, color: '',
  type: 'truck', capacity: null, fuelType: 'diesel', status: 'available', mileage: 0
})
const formErrors = ref({})

const validationRules = {
  licensePlate: [ { required: true, message: t('forms.validation.licensePlateRequired') } ],
  brand: [ { required: true, message: t('forms.validation.brandRequired') } ],
  model: [ { required: true, message: t('forms.validation.modelRequired') } ],
  year: [ { required: true, message: t('forms.validation.yearRequired') } ]
}

const validateForm = () => {
  const validation = ValidationService.validateForm(form.value, validationRules)
  formErrors.value = validation.errors
  return validation.isValid
}

const openNew = () => {
  router.push('/fleet-management/formulario')
}

const openEdit = (vehicle) => {
  router.push(`/fleet-management/formulario/${vehicle.id}`)
}

const save = async () => {
  if (!validateForm()) return
  
  try {
    if (editMode.value) {
      await store.updateVehicle(form.value)
    } else {
      await store.addVehicle(form.value)
    }
    dialogVisible.value = false
  } catch (error) {
    console.error('Error saving vehicle:', error)
  }
}

onMounted(() => {
  store.fetchVehicles()
  if (!usersStore.users?.length) {
    usersStore.fetchUsers()
  }
  maintenanceStore.fetchRecords()
})

watch(() => maintenanceStore.records, () => {
}, { deep: true })

const getStatusDisplayName = (data) => {
  if (data.isInMaintenanceProgress) return 'En Mantenimiento'
  
  if (data.currentDriver && data.currentDriver !== 'Unassigned' && data.currentDriver !== null && data.currentDriver !== 'null') {
    return 'En Uso'
  }
  
  if (data.status === 'in_use') return 'En Uso'
  if (data.status === 'maintenance') return 'En Mantenimiento'
  if (data.status === 'available') return 'Disponible'
  if (data.status === 'out_of_service') return 'Fuera de Servicio'
  
  return data.statusDisplayName || 'Disponible'
}

const getStatusSeverity = (data) => {
  if (data.isInMaintenanceProgress) return 'warning'
  
  if (data.currentDriver && data.currentDriver !== 'Unassigned' && data.currentDriver !== null && data.currentDriver !== 'null') {
    return 'info'
  }
  
  if (data.status === 'in_use') return 'info'
  if (data.status === 'maintenance') return 'warning'
  if (data.status === 'available') return 'success'
  if (data.status === 'out_of_service') return 'danger'
  
  return 'secondary'
}

const assignDialogVisible = ref(false)
const selectedVehicle = ref(null)
const selectedDriver = ref(null)

const driversOptions = computed(() =>
  (usersStore.users || [])
    .filter(u => u.status === 'active' && u.role === 'driver')
    .map(u => ({ label: `${u.fullName} - DNI ${u.dni}`, value: u.fullName }))
)

const openAssignDriver = (vehicle) => {
  selectedVehicle.value = vehicle
  selectedDriver.value = vehicle.currentDriver || null
  assignDialogVisible.value = true
}

const saveAssignDriver = async () => {
  if (!selectedVehicle.value || !selectedDriver.value) return
  
  try {
    await store.assignDriver(selectedVehicle.value.id, selectedDriver.value)
    assignDialogVisible.value = false
  } catch (error) {
    console.error('Error assigning driver:', error)
  }
}
</script>

<template>
  <div class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="text-2xl font-bold">{{ t('fleet.title') }}</h2>
      <pv-button :label="t('fleet.newVehicle')" icon="pi pi-plus" @click="openNew" />
    </div>


    <div class="card">
      <pv-data-table :value="vehiclesWithMaintenanceStatus" :loading="store.loading" paginator :rows="10" :rows-per-page-options="[5,10,20]">
        <pv-column field="licensePlate" :header="t('fleet.table.licensePlate')" sortable />
        <pv-column field="model" :header="t('fleet.table.model')" sortable />
        <pv-column field="status" :header="t('fleet.table.status')" sortable>
          <template #body="{ data }">
            <pv-tag 
              :value="getStatusDisplayName(data)" 
              :severity="getStatusSeverity(data)" 
            />
          </template>
        </pv-column>
        <pv-column field="currentDriver" :header="t('fleet.table.driver')">
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-user" />
              <span v-if="data.currentDriver">{{ data.currentDriver }}</span>
              <span v-else class="text-gray-400">{{ t('fleet.unassigned') }}</span>
            </div>
          </template>
        </pv-column>
        <pv-column field="mileage" :header="t('fleet.table.mileage')" sortable>
          <template #body="{ data }">
            <i class="pi pi-gauge" /> {{ (data.mileage || 0).toLocaleString() }} km
          </template>
        </pv-column>
        <pv-column :header="t('common.actions')" :style="{ width: '200px' }">
          <template #body="{ data }">
            <div class="flex gap-2">
              <pv-button icon="pi pi-pencil" size="small" text rounded severity="info" @click="openEdit(data)" v-tooltip.top="t('common.edit')" />
              <pv-button icon="pi pi-user-plus" size="small" text rounded severity="success" @click="openAssignDriver(data)" v-tooltip.top="t('common.assignDriver')" />
            </div>
          </template>
        </pv-column>
      </pv-data-table>
    </div>

    <pv-dialog v-model:visible="assignDialogVisible" modal :header="t('fleet.assignDriver')" :style="{ width: '480px' }" :closable="false">
      <div class="flex flex-column gap-3">
        <div class="mb-2"><strong>{{ t('fleet.vehicle') }}:</strong> {{ selectedVehicle ? selectedVehicle.licensePlate + ' - ' + selectedVehicle.model : '' }}</div>
        <pv-select v-model="selectedDriver" :options="driversOptions" option-label="label" option-value="value" class="w-full" :placeholder="t('fleet.selectDriver')" />
      </div>
      <template #footer>
        <div class="flex justify-content-end gap-2">
          <pv-button :label="t('common.cancel')" severity="secondary" text @click="assignDialogVisible = false" />
          <pv-button :label="t('common.save')" icon="pi pi-save" @click="saveAssignDriver" :disabled="!selectedDriver" />
        </div>
      </template>
    </pv-dialog>

    <pv-dialog v-model:visible="dialogVisible" modal :header="editMode ? t('forms.vehicle.editVehicle') : t('forms.vehicle.newVehicle')" :style="{ width: '600px' }" :closable="false">
      <div class="grid">
        <div class="col-12 md:col-6">
          <pv-float-label>
            <pv-input-text id="licensePlate" v-model="form.licensePlate" class="w-full" :class="{ 'p-invalid': formErrors.licensePlate }" />
            <label for="licensePlate">{{ t('forms.vehicle.licensePlate') }} *</label>
          </pv-float-label>
          <small v-if="formErrors.licensePlate" class="p-error">{{ formErrors.licensePlate }}</small>
        </div>
        <div class="col-12 md:col-6">
          <pv-float-label>
            <pv-input-text id="brand" v-model="form.brand" class="w-full" :class="{ 'p-invalid': formErrors.brand }" />
            <label for="brand">{{ t('forms.vehicle.brand') }} *</label>
          </pv-float-label>
          <small v-if="formErrors.brand" class="p-error">{{ formErrors.brand }}</small>
        </div>
        <div class="col-12 md:col-6">
          <pv-float-label>
            <pv-input-text id="model" v-model="form.model" class="w-full" :class="{ 'p-invalid': formErrors.model }" />
            <label for="model">{{ t('forms.vehicle.model') }} *</label>
          </pv-float-label>
          <small v-if="formErrors.model" class="p-error">{{ formErrors.model }}</small>
        </div>
        <div class="col-12 md:col-6">
          <pv-float-label>
            <pv-input-number id="year" v-model="form.year" class="w-full" :class="{ 'p-invalid': formErrors.year }" />
            <label for="year">{{ t('forms.vehicle.year') }} *</label>
          </pv-float-label>
          <small v-if="formErrors.year" class="p-error">{{ formErrors.year }}</small>
        </div>
        <div class="col-12 md:col-6">
          <pv-float-label>
            <pv-input-text id="color" v-model="form.color" class="w-full" />
            <label for="color">{{ t('forms.vehicle.color') }}</label>
          </pv-float-label>
        </div>
        <div class="col-12 md:col-6">
          <pv-float-label>
            <pv-input-number id="capacity" v-model="form.capacity" class="w-full" :min="0" :max="50000" />
            <label for="capacity">{{ t('forms.vehicle.capacity') }}</label>
          </pv-float-label>
        </div>
        <div class="col-12 md:col-6">
          <pv-float-label>
            <pv-input-number id="mileage" v-model="form.mileage" class="w-full" :min="0" :max="999999" />
            <label for="mileage">{{ t('forms.vehicle.mileage') }}</label>
          </pv-float-label>
        </div>
        <div class="col-12 md:col-6">
          <pv-select 
            v-model="form.fuelType" 
            :options="[
              { label: t('forms.vehicle.fuelTypeOptions.diesel'), value: 'diesel' },
              { label: t('forms.vehicle.fuelTypeOptions.gasoline'), value: 'gasoline' },
              { label: t('forms.vehicle.fuelTypeOptions.gas'), value: 'gas' }
            ]" 
            option-label="label" 
            option-value="value" 
            class="w-full" 
            :placeholder="t('forms.vehicle.fuelType')"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-content-end gap-2">
          <pv-button :label="t('common.cancel')" severity="secondary" text @click="dialogVisible = false" />
          <pv-button :label="t('common.save')" icon="pi pi-save" @click="save" />
        </div>
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>

</style>
