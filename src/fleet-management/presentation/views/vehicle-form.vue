<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useVehiclesStore } from '../../application/vehicles.store.js'
import { useUsersStore } from '../../../ user-management/application/users.store.js'
import { ValidationService } from '../../../shared/infrastructure/validation.service.js'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()
const vehiclesStore = useVehiclesStore()
const usersStore = useUsersStore()

const form = ref({
  licensePlate: '',
  brand: '',
  model: '',
  year: null,
  color: '',
  type: 'truck',
  capacity: null,
  fuelType: 'gasoline',
  status: 'available',
  mileage: 0
})

const formErrors = ref({})
const editMode = ref(false)
const loading = ref(false)

const validationRules = computed(() => ({
  licensePlate: [ { required: true, message: t('forms.validation.licensePlateRequired') } ],
  brand: [ { required: true, message: t('forms.validation.brandRequired') } ],
  model: [ { required: true, message: t('forms.validation.modelRequired') } ],
  year: [ { required: true, message: t('forms.validation.yearRequired') } ]
}))

const typeOptions = computed(() => [
  { label: t('forms.vehicle.typeOptions.truck'), value: 'truck' },
  { label: t('forms.vehicle.typeOptions.van'), value: 'van' },
  { label: t('forms.vehicle.typeOptions.car'), value: 'car' },
  { label: t('forms.vehicle.typeOptions.motorcycle'), value: 'motorcycle' },
  { label: t('forms.vehicle.typeOptions.trailer'), value: 'trailer' }
])

const fuelTypeOptions = computed(() => [
  { label: t('forms.vehicle.fuelTypeOptions.diesel'), value: 'diesel' },
  { label: t('forms.vehicle.fuelTypeOptions.gasoline'), value: 'gasoline' },
  { label: t('forms.vehicle.fuelTypeOptions.gas'), value: 'gas' }
])

const statusOptions = computed(() => [
  { label: t('forms.vehicle.statusOptions.available'), value: 'available' },
  { label: t('forms.vehicle.statusOptions.inUse'), value: 'in_use' },
  { label: t('forms.vehicle.statusOptions.maintenance'), value: 'maintenance' },
  { label: t('forms.vehicle.statusOptions.outOfService'), value: 'out_of_service' }
])

const driversOptions = computed(() =>
  (usersStore.users || [])
    .filter(u => u.status === 'active' && u.role === 'driver')
    .map(u => ({ label: `${u.fullName} - DNI ${u.dni}`, value: u.fullName }))
)

const validateForm = () => {
  const validation = ValidationService.validateForm(form.value, validationRules.value)
  formErrors.value = validation.errors
  return validation.isValid
}

const save = async () => {
  if (!validateForm()) return
  
  loading.value = true
  try {
    if (editMode.value) {
      await vehiclesStore.updateVehicle(form.value)
    } else {
      await vehiclesStore.addVehicle(form.value)
    }
    router.push('/fleet-management')
  } catch (error) {
    console.error('Error saving vehicle:', error)
  } finally {
    loading.value = false
  }
}

const cancel = () => {
  router.push('/fleet-management')
}

onMounted(async () => {
  const vehicleId = route.params.id
  if (vehicleId) {
    editMode.value = true
    // Cargar datos del vehículo para editar
    const vehicle = vehiclesStore.vehicles.find(v => v.id == vehicleId)
    if (vehicle) {
      form.value = {
        id: vehicle.id,
        licensePlate: vehicle.licensePlate || vehicle.license_plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        type: vehicle.type,
        capacity: vehicle.capacity,
        fuelType: vehicle.fuelType || vehicle.fuel_type,
        status: vehicle.status,
        mileage: vehicle.mileage || 0
      }
    }
  }
  
  // Cargar datos necesarios
  if (!vehiclesStore.vehicles.length) {
    await vehiclesStore.fetchVehicles()
  }
  if (!usersStore.users.length) {
    await usersStore.fetchUsers()
  }
})
</script>

<template>
  <div class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="text-2xl font-bold">
        {{ editMode ? t('forms.vehicle.editVehicle') : t('forms.vehicle.newVehicle') }}
      </h2>
      <pv-button 
        :label="t('common.back')" 
        icon="pi pi-arrow-left" 
        severity="secondary" 
        @click="cancel" 
      />
    </div>

    <div class="card">
      <form @submit.prevent="save" class="p-4">
        <div class="grid">
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-text 
                id="licensePlate" 
                v-model="form.licensePlate" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.licensePlate }" 
              />
              <label for="licensePlate">{{ t('forms.vehicle.licensePlate') }} *</label>
            </pv-float-label>
            <small v-if="formErrors.licensePlate" class="p-error">{{ formErrors.licensePlate }}</small>
          </div>

          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-text 
                id="brand" 
                v-model="form.brand" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.brand }" 
              />
              <label for="brand">{{ t('forms.vehicle.brand') }} *</label>
            </pv-float-label>
            <small v-if="formErrors.brand" class="p-error">{{ formErrors.brand }}</small>
          </div>

          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-text 
                id="model" 
                v-model="form.model" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.model }" 
              />
              <label for="model">{{ t('forms.vehicle.model') }} *</label>
            </pv-float-label>
            <small v-if="formErrors.model" class="p-error">{{ formErrors.model }}</small>
          </div>

          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-number 
                id="year" 
                v-model="form.year" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.year }"
                :min="1900"
                :max="2030"
              />
              <label for="year">{{ t('forms.vehicle.year') }} *</label>
            </pv-float-label>
            <small v-if="formErrors.year" class="p-error">{{ formErrors.year }}</small>
          </div>

          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-text 
                id="color" 
                v-model="form.color" 
                class="w-full" 
              />
              <label for="color">{{ t('forms.vehicle.color') }}</label>
            </pv-float-label>
          </div>

          <div class="col-12 md:col-6">
            <div class="p-3 bg-light border rounded">
              <strong>{{ t('forms.vehicle.type') }}:</strong> {{ t('forms.vehicle.typeOptions.truck') }}
            </div>
          </div>

          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-number 
                id="capacity" 
                v-model="form.capacity" 
                class="w-full" 
                :min="0" 
                :max="50000" 
              />
              <label for="capacity">{{ t('forms.vehicle.capacity') }}</label>
            </pv-float-label>
          </div>

          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-number 
                id="mileage" 
                v-model="form.mileage" 
                class="w-full" 
                :min="0" 
                :max="999999" 
              />
              <label for="mileage">{{ t('forms.vehicle.mileage') }}</label>
            </pv-float-label>
          </div>

          <div class="col-12 md:col-6">
            <div class="p-3 bg-light border rounded">
              <strong>{{ t('forms.vehicle.fuelType') }}:</strong> {{ t('forms.vehicle.fuelTypeOptions.gasoline') }}
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="p-3 bg-light border rounded">
              <strong>Estado:</strong> Disponible
            </div>
          </div>
        </div>

        <div class="flex justify-content-end gap-2 mt-4">
          <pv-button 
            label="Cancelar" 
            severity="secondary" 
            @click="cancel" 
          />
          <pv-button 
            :label="editMode ? 'Actualizar' : 'Crear'" 
            icon="pi pi-save" 
            :loading="loading"
            @click="save" 
          />
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #f8f9fa;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

:deep(.p-float-label label) {
  font-weight: 600;
  color: #6c757d;
}

:deep(.p-inputtext) {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #495057;
}

:deep(.p-inputtext:focus) {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

:deep(.p-inputtext.p-invalid) {
  border-color: #dc3545;
}

:deep(.p-select) {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #495057;
}

:deep(.p-select:focus) {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

:deep(.p-select.p-invalid) {
  border-color: #dc3545;
}

:deep(.p-inputnumber) {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #495057;
}

:deep(.p-inputnumber:focus) {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

:deep(.p-button.p-button-secondary) {
  background: #6c757d;
  border-color: #6c757d;
  color: #ffffff;
}

:deep(.p-button:not(.p-button-secondary)) {
  background: #007bff;
  border-color: #007bff;
  color: #ffffff;
}

.p-error {
  color: #dc3545;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

h2 {
  color: #495057;
}

label {
  color: #6c757d;
}
</style>
