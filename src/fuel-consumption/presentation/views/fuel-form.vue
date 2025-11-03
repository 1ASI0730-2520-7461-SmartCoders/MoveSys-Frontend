<script setup>
import { onMounted, ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFuelStore } from '../../application/fuel.store.js'
import { useVehiclesStore } from '../../../fleet-management/application/vehicles.store.js'
import { ValidationService } from '../../../shared/infrastructure/validation.service.js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const store = useFuelStore()
const vehiclesStore = useVehiclesStore()

const form = ref({
  selectedVehicle: null,
  vehicleId: null,
  vehiclePlate: '',
  model: '',
  liters: 0,
  costPerLiter: 0,
  totalPaid: 0,
  fuelType: 'diesel',
  provider: '',
  filledAt: '',
  odometer: null,
  notes: ''
})
const formErrors = ref({})
const loading = ref(false)
const editMode = ref(false)
const isInitializing = ref(false)

const fuelTypeOptions = computed(() => [
  { label: t('fuel.form.types.diesel'), value: 'diesel' },
  { label: t('fuel.form.types.gasoline'), value: 'gasoline' },
  { label: t('fuel.form.types.electric'), value: 'electric' },
  { label: t('fuel.form.types.hybrid'), value: 'hybrid' }
])

const validationRules = {
  selectedVehicle: [{ required: true, message: 'Seleccione un vehículo' }],
  liters: [{ required: true, message: 'Litros requeridos' }, { positive: true, message: 'Debe ser > 0' }],
  costPerLiter: [{ required: true, message: 'Costo por litro requerido' }, { positive: true, message: 'Debe ser > 0' }],
  fuelType: [{ required: true, message: 'Tipo de combustible requerido' }],
  provider: [{ required: true, message: 'Proveedor requerido' }],
}

// Computed para listar vehículos disponibles
const availableVehicles = computed(() => {
  return (vehiclesStore.vehicles || [])
      .filter(v => v.status === 'available' || v.status === 'in_use')
      .map(v => ({
        label: `${v.licensePlate || v.license_plate} - ${v.brand} ${v.model}`,
        value: v.id,
        plate: v.licensePlate || v.license_plate,
        model: `${v.brand} ${v.model}`,
        odometer: v.mileage
      }))
})

// Función para actualizar datos del vehículo al seleccionar
const onVehicleSelect = (vehicleId) => {
  const vehicle = availableVehicles.value.find(v => v.value === vehicleId)
  if (vehicle) {
    const fullVehicle = vehiclesStore.vehicles.find(v => v.id === vehicleId)
    if (fullVehicle) {
      form.value.vehicleId = vehicleId
      form.value.vehiclePlate = vehicle.plate
      form.value.model = `${fullVehicle.brand} ${fullVehicle.model}`
      form.value.odometer = vehicle.odometer
    }
  }
}

const validateForm = () => {
  const validation = ValidationService.validateForm(form.value, validationRules)
  formErrors.value = validation.errors
  return validation.isValid
}

const calculateTotalPaid = () => {
  const liters = Number(form.value.liters) || 0
  const costPerLiter = Number(form.value.costPerLiter) || 0
  form.value.totalPaid = liters * costPerLiter
}

const stopWatcher = watch(() => [form.value.liters, form.value.costPerLiter], () => {
  if (!isInitializing.value) {
    calculateTotalPaid()
  }
})

onBeforeUnmount(() => {
  stopWatcher()
})

onMounted(async () => {
  console.log('FuelForm mounted')
  isInitializing.value = true
  await vehiclesStore.fetchVehicles()

  // Check if editing
  const entryId = route.params.id
  if (entryId) {
    editMode.value = true
    await store.fetchEntries()
    const entry = store.entries.find(e => e.id == entryId)
    if (entry) {
      try {
        form.value = {
          selectedVehicle: entry.vehicleId || null,
          vehicleId: entry.vehicleId || null,
          vehiclePlate: entry.vehiclePlate || '',
          model: entry.model || '',
          liters: Number(entry.liters) || 0,
          costPerLiter: Number(entry.costPerLiter) || 0,
          totalPaid: Number(entry.totalPaid) || 0,
          fuelType: entry.fuelType || 'diesel',
          provider: entry.provider || '',
          filledAt: entry.filledAt ? new Date(entry.filledAt).toISOString().split('T')[0] : '',
          odometer: entry.odometer != null ? Number(entry.odometer) : null,
          notes: entry.notes || ''
        }
        calculateTotalPaid()
      } catch (error) {
        console.error('Error setting form values:', error)
      }
    }
  }
  // Allow watchers to run after initialization
  nextTick(() => {
    isInitializing.value = false
  })
})

const handleSave = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    const entryData = {
      vehicleId: form.value.vehicleId,
      vehiclePlate: form.value.vehiclePlate,
      model: form.value.model,
      liters: form.value.liters,
      costPerLiter: form.value.costPerLiter,
      totalPaid: form.value.totalPaid,
      fuelType: form.value.fuelType,
      provider: form.value.provider,
      filledAt: form.value.filledAt,
      odometer: form.value.odometer,
      notes: form.value.notes
    }

    if (editMode.value) {
      entryData.id = route.params.id
      await store.updateEntry(entryData)
    } else {
      await store.addEntry(entryData)
    }

    router.push('/fuel-consumption')
  } catch (error) {
    console.error('Error saving:', error)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/fuel-consumption')
}
</script>

<template>
  <div class="fuel-form-container">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="text-2xl font-bold">
        {{ editMode ? $t('common.edit') + ' ' + t('fuel.form.title') : t('fuel.form.newTitle') }}
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
              <label for="selectedVehicle" class="block mb-2">{{ t('fuel.form.vehicle') }} *</label>
              <pv-select
                  id="selectedVehicle"
                  v-model="form.selectedVehicle"
                  :options="availableVehicles"
                  option-label="label"
                  option-value="value"
                  :placeholder="t('fuel.form.selectVehicle')"
                  class="w-full"
                  @update:model-value="onVehicleSelect"
              />
              <small v-if="formErrors.selectedVehicle" class="p-error">{{ formErrors.selectedVehicle }}</small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="fuelType" class="block mb-2">{{ t('fuel.form.fuelType') }} *</label>
              <pv-select
                  id="fuelType"
                  v-model="form.fuelType"
                  :options="fuelTypeOptions"
                  option-label="label"
                  option-value="value"
                  :placeholder="t('fuel.form.fuelType')"
                  class="w-full"
              />
              <small v-if="formErrors.fuelType" class="p-error">{{ formErrors.fuelType }}</small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="liters" class="block mb-2">{{ t('fuel.form.quantity') }} *</label>
              <pv-input-number
                  id="liters"
                  v-model="form.liters"
                  suffix=" L"
                  :min="0"
                  :max="9999"
                  class="w-full"
              />
              <small v-if="formErrors.liters" class="p-error">{{ formErrors.liters }}</small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="costPerLiter" class="block mb-2">{{ t('fuel.form.costPerLiter') }} *</label>
              <pv-input-number
                  id="costPerLiter"
                  v-model="form.costPerLiter"
                  prefix="S/. "
                  :min="0"
                  :maxFractionDigits="2"
                  class="w-full"
              />
              <small v-if="formErrors.costPerLiter" class="p-error">{{ formErrors.costPerLiter }}</small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="totalPaid" class="block mb-2">{{ t('fuel.form.totalPaid') }}</label>
              <pv-input-number
                  id="totalPaid"
                  v-model="form.totalPaid"
                  prefix="S/. "
                  :min="0"
                  :maxFractionDigits="2"
                  class="w-full"
                  :readonly="true"
              />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="provider" class="block mb-2">{{ t('fuel.form.provider') }} *</label>
              <pv-input-text
                  id="provider"
                  v-model="form.provider"
                  :placeholder="t('fuel.form.providerPlaceholder')"
                  class="w-full"
              />
              <small v-if="formErrors.provider" class="p-error">{{ formErrors.provider }}</small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="filledAt" class="block mb-2">{{ t('fuel.form.filledAt') }}</label>
              <pv-calendar
                  id="filledAt"
                  v-model="form.filledAt"
                  :placeholder="t('fuel.form.selectDate')"
                  class="w-full"
                  showIcon
              />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="odometer" class="block mb-2">{{ t('fuel.form.odometer') }}</label>
              <pv-input-number
                  id="odometer"
                  v-model="form.odometer"
                  suffix=" km"
                  :min="0"
                  class="w-full"
              />
            </div>
          </div>

          <div class="col-12">
            <div class="field mb-4">
              <label for="notes" class="block mb-2">{{ t('fuel.form.notes') }}</label>
              <pv-textarea
                  id="notes"
                  v-model="form.notes"
                  rows="4"
                  :placeholder="t('fuel.form.notesPlaceholder')"
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
              :label="editMode ? t('common.update') : t('fuel.form.create')"
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
.fuel-form-container {
  padding: 2rem;
  background-color: #ffffff;
  min-height: 100vh;
}

.field label {
  font-weight: 600;
  color: #1a1a1a;
}

.fuel-form-container h2 {
  color: #1a1a1a;
}

.fuel-form-container :deep(.p-card) {
  background-color: white;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.fuel-form-container :deep(.p-inputtext),
.fuel-form-container :deep(.p-dropdown),
.fuel-form-container :deep(.p-calendar input),
.fuel-form-container :deep(.p-inputnumber input),
.fuel-form-container :deep(.p-textarea) {
  background-color: #ffffff !important;
  color: #000000 !important;
  border: 1px solid #e0e0e0;
}

.fuel-form-container :deep(.p-inputtext::placeholder),
.fuel-form-container :deep(.p-textarea::placeholder) {
  color: #adb5bd !important;
}

.fuel-form-container :deep(.p-dropdown-label) {
  background-color: #ffffff !important;
  color: #000000 !important;
}

.fuel-form-container :deep(.p-dropdown-panel) {
  background-color: #ffffff !important;
  border: 1px solid #e0e0e0;
}

.fuel-form-container :deep(.p-dropdown-panel .p-dropdown-item) {
  background-color: #ffffff !important;
  color: #000000 !important;
}

.fuel-form-container :deep(.p-dropdown-panel .p-dropdown-item:hover) {
  background-color: #f8f9fa !important;
  color: #000000 !important;
}

.fuel-form-container :deep(.p-dropdown-panel .p-dropdown-item.p-highlight) {
  background-color: #e9ecef !important;
  color: #000000 !important;
}

.fuel-form-container :deep(.p-select) {
  background-color: #ffffff !important;
  color: #000000 !important;
}

.fuel-form-container :deep(.p-select-label) {
  background-color: #ffffff !important;
  color: #000000 !important;
}

.fuel-form-container :deep(.p-select-trigger) {
  background-color: #ffffff !important;
  color: #000000 !important;
}

.fuel-form-container :deep(.p-inputtext:focus),
.fuel-form-container :deep(.p-dropdown:focus),
.fuel-form-container :deep(.p-calendar:focus input),
.fuel-form-container :deep(.p-inputnumber:focus input),
.fuel-form-container :deep(.p-textarea:focus) {
  border-color: #0066ff;
  box-shadow: 0 0 0 2px rgba(0, 102, 255, 0.2);
}

.fuel-form-container :deep(.p-button-secondary) {
  background-color: #5a6268;
  border-color: #5a6268;
  color: white;
}

.fuel-form-container :deep(.p-button-secondary:hover) {
  background-color: #485057;
  border-color: #485057;
}

.fuel-form-container :deep(.p-calendar-button) {
  background-color: #ffffff;
  border-color: #e0e0e0;
  color: #000000;
}

.fuel-form-container :deep(.p-calendar-button:hover) {
  background-color: #f8f9fa;
}
</style>

