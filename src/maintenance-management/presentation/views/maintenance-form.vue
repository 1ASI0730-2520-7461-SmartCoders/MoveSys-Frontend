<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMaintenanceStore } from '../../application/maintenance.store.js'
import { useVehiclesStore } from '../../../fleet-management/application/vehicles.store.js'
import { ValidationService } from '../../../shared/infrastructure/validation.service.js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const store = useMaintenanceStore()
const vehiclesStore = useVehiclesStore()

const form = ref({
  selectedVehicle: null,
  vehicleId: null,
  vehiclePlate: '',
  model: '',
  maintenanceType: 'preventive',
  description: '',
  cost: 0,
  mileage: null,
  maintenanceDate: '',
  nextMaintenanceDate: '',
  nextMaintenanceMileage: null,
  provider: '',
  parts: [],
  mechanic: '',
  notes: '',
  status: 'scheduled'
})
const formErrors = ref({})
const loading = ref(false)
const editMode = ref(false)

const maintenanceTypeOptions = computed(() => [
  { label: t('maintenance.types.preventive'), value: 'preventive' },
  { label: t('maintenance.types.corrective'), value: 'corrective' },
  { label: t('maintenance.types.emergency'), value: 'emergency' }
])

const statusOptions = computed(() => [
  { label: t('maintenance.statuses.scheduled'), value: 'scheduled' },
  { label: t('maintenance.statuses.inProgress'), value: 'in_progress' },
  { label: t('maintenance.statuses.completed'), value: 'completed' },
  { label: t('maintenance.statuses.cancelled'), value: 'cancelled' }
])

const validationRules = {
  selectedVehicle: [{ required: true, message: 'Seleccione un vehículo' }],
  maintenanceType: [{ required: true, message: 'Tipo de mantenimiento requerido' }],
  description: [{ required: true, message: 'Descripción requerida' }],
  cost: [{ required: true, message: 'Costo requerido' }],
  provider: [{ required: true, message: 'Proveedor requerido' }],
}

// Computed para listar vehículos disponibles
const availableVehicles = computed(() => {
  console.log('Computing available vehicles, vehiclesStore.vehicles:', vehiclesStore.vehicles)
  const vehicles = (vehiclesStore.vehicles || [])
    .filter(v => v.status === 'available' || v.status === 'in_use' || v.status === 'maintenance')
    .map(v => ({
      label: `${v.licensePlate || v.license_plate} - ${v.brand} ${v.model}`,
      value: v.id,
      plate: v.licensePlate || v.license_plate,
      model: `${v.brand} ${v.model}`,
      mileage: v.mileage
    }))
  
  console.log('Available vehicles computed result:', vehicles)
  return vehicles
})

const onVehicleSelect = (vehicleId) => {
  const vehicle = availableVehicles.value.find(v => v.value === vehicleId)
  if (vehicle) {
    const fullVehicle = vehiclesStore.vehicles.find(v => v.id === vehicleId)
    if (fullVehicle) {
      form.value.vehicleId = vehicleId
      form.value.vehiclePlate = vehicle.plate
      form.value.model = `${fullVehicle.brand} ${fullVehicle.model}`
      form.value.mileage = vehicle.mileage
    }
  }
}

const validateForm = () => {
  const validation = ValidationService.validateForm(form.value, validationRules)
  formErrors.value = validation.errors
  return validation.isValid
}

const handleSave = async () => {
  if (!validateForm()) return
  
  loading.value = true
  try {
    const entryData = {
      vehicleId: form.value.vehicleId,
      vehiclePlate: form.value.vehiclePlate,
      model: form.value.model,
      maintenanceType: form.value.maintenanceType,
      description: form.value.description,
      cost: form.value.cost,
      mileage: form.value.mileage,
      maintenanceDate: form.value.maintenanceDate,
      nextMaintenanceDate: form.value.nextMaintenanceDate,
      nextMaintenanceMileage: form.value.nextMaintenanceMileage,
      provider: form.value.provider,
      parts: form.value.parts,
      mechanic: form.value.mechanic,
      notes: form.value.notes,
      status: form.value.status
    }
    
    if (editMode.value) {
      entryData.id = route.params.id
      await store.updateRecord(entryData)
    } else {
      await store.addRecord(entryData)
    }
    
    router.push('/maintenance')
  } catch (error) {
    console.error('Error saving:', error)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/maintenance')
}

const addPart = () => {
  form.value.parts.push({ name: '', cost: 0, quantity: 1 })
}

const removePart = (index) => {
  form.value.parts.splice(index, 1)
}

onMounted(async () => {
  console.log('MaintenanceForm mounted - fetching vehicles...')
  try {
    await vehiclesStore.fetchVehicles()
    console.log('Vehicles loaded:', vehiclesStore.vehicles)
    console.log('Available vehicles count:', availableVehicles.value.length)
    console.log('Available vehicles:', availableVehicles.value)
  } catch (error) {
    console.error('Error fetching vehicles:', error)
  }
  
  // Check if editing
  const entryId = route.params.id
  if (entryId) {
    editMode.value = true
    await store.fetchRecords()
    const entry = store.records.find(r => r.id == entryId)
    if (entry) {
      const vehicle = availableVehicles.value.find(v => v.plate === entry.vehiclePlate)
      form.value = {
        ...entry,
        selectedVehicle: vehicle ? vehicle.value : null,
        maintenanceDate: entry.maintenanceDate ? new Date(entry.maintenanceDate).toISOString().split('T')[0] : '',
        nextMaintenanceDate: entry.nextMaintenanceDate ? new Date(entry.nextMaintenanceDate).toISOString().split('T')[0] : '',
        parts: entry.parts || []
      }
    }
  }
})
</script>

<template>
  <div class="maintenance-form-container">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="text-2xl font-bold">
        {{ editMode ? $t('common.edit') + ' ' + t('maintenance.title') : t('maintenance.newMaintenance') }}
      </h2>
      <pv-button 
        :label="t('common.back')" 
        icon="pi pi-arrow-left" 
        severity="secondary"
        @click="handleCancel" 
      />
    </div>

    <pv-card>
      <template #content>
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="selectedVehicle" class="block mb-2">{{ t('maintenance.form.vehicle') }} *</label>
              <pv-select
                id="selectedVehicle"
                v-model="form.selectedVehicle"
                :options="availableVehicles"
                option-label="label"
                option-value="value"
                :placeholder="t('maintenance.form.selectVehicle')"
                class="w-full"
                @update:model-value="onVehicleSelect"
              />
              <small v-if="formErrors.selectedVehicle" class="p-error">{{ formErrors.selectedVehicle }}</small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="maintenanceType" class="block mb-2">{{ t('maintenance.form.maintenanceType') }} *</label>
              <pv-select
                id="maintenanceType"
                v-model="form.maintenanceType"
                :options="maintenanceTypeOptions"
                option-label="label"
                option-value="value"
                :placeholder="t('maintenance.form.maintenanceType')"
                class="w-full"
              />
              <small v-if="formErrors.maintenanceType" class="p-error">{{ formErrors.maintenanceType }}</small>
            </div>
          </div>

          <div class="col-12">
            <div class="field mb-4">
              <label for="description" class="block mb-2">{{ t('maintenance.form.description') }} *</label>
              <pv-textarea
                id="description"
                v-model="form.description"
                rows="3"
                :placeholder="t('maintenance.form.description')"
                class="w-full"
              />
              <small v-if="formErrors.description" class="p-error">{{ formErrors.description }}</small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="cost" class="block mb-2">{{ t('maintenance.form.cost') }} *</label>
              <pv-input-number
                id="cost"
                v-model="form.cost"
                prefix="S/. "
                :min="0"
                :maxFractionDigits="2"
                class="w-full"
              />
              <small v-if="formErrors.cost" class="p-error">{{ formErrors.cost }}</small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="mileage" class="block mb-2">{{ t('maintenance.form.mileage') }}</label>
              <pv-input-number
                id="mileage"
                v-model="form.mileage"
                suffix=" km"
                :min="0"
                class="w-full"
              />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="maintenanceDate" class="block mb-2">{{ t('maintenance.form.maintenanceDate') }}</label>
              <pv-calendar
                id="maintenanceDate"
                v-model="form.maintenanceDate"
                :placeholder="t('maintenance.form.maintenanceDate')"
                class="w-full"
                showIcon
              />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="nextMaintenanceDate" class="block mb-2">{{ t('maintenance.form.nextMaintenanceDate') }}</label>
              <pv-calendar
                id="nextMaintenanceDate"
                v-model="form.nextMaintenanceDate"
                :placeholder="t('maintenance.form.nextMaintenanceDate')"
                class="w-full"
                showIcon
              />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="provider" class="block mb-2">{{ t('maintenance.form.provider') }} *</label>
              <pv-input-text
                id="provider"
                v-model="form.provider"
                :placeholder="t('maintenance.form.provider')"
                class="w-full"
              />
              <small v-if="formErrors.provider" class="p-error">{{ formErrors.provider }}</small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="status" class="block mb-2">{{ t('maintenance.form.status') }}</label>
              <pv-select
                id="status"
                v-model="form.status"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                class="w-full"
              />
            </div>
          </div>

          <div class="col-12">
            <div class="field mb-4">
              <div class="flex justify-content-between align-items-center mb-2">
                <label>{{ t('maintenance.form.parts') }}</label>
                <pv-button 
                  :label="t('maintenance.form.addPart')" 
                  icon="pi pi-plus" 
                  severity="success"
                  text
                  @click="addPart"
                />
              </div>
              <div v-for="(part, index) in form.parts" :key="index" class="flex align-items-center gap-2 mb-2">
                <pv-input-text 
                  v-model="part.name" 
                  :placeholder="t('maintenance.form.partName')" 
                  class="flex-1"
                />
                <pv-input-number 
                  v-model="part.quantity" 
                  :min="1" 
                  :placeholder="t('maintenance.form.quantity')" 
                  class="flex-1"
                />
                <pv-input-number 
                  v-model="part.cost" 
                  prefix="S/. "
                  :min="0"
                  :placeholder="t('maintenance.form.partCost')" 
                  class="flex-1"
                />
                <pv-button 
                  icon="pi pi-times" 
                  severity="danger" 
                  text 
                  @click="removePart(index)"
                />
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="field mb-4">
              <label for="notes" class="block mb-2">{{ t('maintenance.form.notes') }}</label>
              <pv-textarea
                id="notes"
                v-model="form.notes"
                rows="3"
                :placeholder="t('maintenance.form.notes')"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-content-end gap-2 mt-4">
          <pv-button 
            :label="t('common.cancel')" 
            severity="secondary"
            @click="handleCancel"
          />
          <pv-button 
            :label="editMode ? t('common.update') : t('common.save')" 
            icon="pi pi-check"
            @click="handleSave"
            :loading="loading"
          />
        </div>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.maintenance-form-container {
  padding: 2rem;
  background-color: #ffffff;
  min-height: 100vh;
}

.field label {
  font-weight: 600;
  color: #1a1a1a;
}

.maintenance-form-container h2 {
  color: #1a1a1a;
}

.maintenance-form-container :deep(.p-card) {
  background-color: white;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.maintenance-form-container :deep(.p-inputtext),
.maintenance-form-container :deep(.p-dropdown),
.maintenance-form-container :deep(.p-calendar input),
.maintenance-form-container :deep(.p-inputnumber input),
.maintenance-form-container :deep(.p-textarea) {
  background-color: #ffffff !important;
  color: #000000 !important;
  border: 1px solid #e0e0e0;
}

.maintenance-form-container :deep(.p-inputtext::placeholder),
.maintenance-form-container :deep(.p-textarea::placeholder) {
  color: #adb5bd !important;
}

.maintenance-form-container :deep(.p-dropdown-label) {
  background-color: #ffffff !important;
  color: #000000 !important;
}

.maintenance-form-container :deep(.p-dropdown-panel) {
  background-color: #ffffff !important;
  border: 1px solid #e0e0e0;
}

.maintenance-form-container :deep(.p-dropdown-panel .p-dropdown-item) {
  background-color: #ffffff !important;
  color: #000000 !important;
}

.maintenance-form-container :deep(.p-dropdown-panel .p-dropdown-item:hover) {
  background-color: #f8f9fa !important;
  color: #000000 !important;
}

.maintenance-form-container :deep(.p-dropdown-panel .p-dropdown-item.p-highlight) {
  background-color: #e9ecef !important;
  color: #000000 !important;
}

.maintenance-form-container :deep(.p-select) {
  background-color: #ffffff !important;
  color: #000000 !important;
}

.maintenance-form-container :deep(.p-select-label) {
  background-color: #ffffff !important;
  color: #000000 !important;
}

.maintenance-form-container :deep(.p-select-trigger) {
  background-color: #ffffff !important;
  color: #000000 !important;
}

.maintenance-form-container :deep(.p-inputtext:focus),
.maintenance-form-container :deep(.p-dropdown:focus),
.maintenance-form-container :deep(.p-calendar:focus input),
.maintenance-form-container :deep(.p-inputnumber:focus input),
.maintenance-form-container :deep(.p-textarea:focus) {
  border-color: #0066ff;
  box-shadow: 0 0 0 2px rgba(0, 102, 255, 0.1);
}

.maintenance-form-container :deep(.p-button-secondary) {
  background-color: #5a6268;
  border-color: #5a6268;
  color: white;
}

.maintenance-form-container :deep(.p-button-secondary:hover) {
  background-color: #495057;
  border-color: #495057;
}

.maintenance-form-container :deep(.p-calendar-button) {
  background-color: #ffffff;
  border-color: #e0e0e0;
  color: #000000;
}

.maintenance-form-container :deep(.p-calendar-button:hover) {
  background-color: #f8f9fa;
}

.flex-1 {
  flex: 1;
}
</style>

