<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDeliveriesStore } from '../../application/deliveries.store.js'
import { useVehiclesStore } from '../../../fleet-management/application/vehicles.store.js'
import { useUsersStore } from '../../../user-management/application/users.store.js'
import { ValidationService } from '../../../shared/infrastructure/validation.service.js'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()
const deliveriesStore = useDeliveriesStore()
const vehiclesStore = useVehiclesStore()
const usersStore = useUsersStore()

const form = ref({
  code: '',
  customerName: '',
  address: '',
  originProvince: '',
  destinationProvince: '',
  status: 'pending',
  driverName: '',
  vehiclePlate: '',
  distanceKm: null,
  etaMinutes: null
})

// Watcher para debugging - ver cambios en tiempo real
watch(() => form.value.originProvince, (newVal) => {
  console.log(' Origin Province cambió:', newVal, 'Tipo:', typeof newVal)
})

watch(() => form.value.destinationProvince, (newVal) => {
  console.log(' Destination Province cambió:', newVal, 'Tipo:', typeof newVal)
})

const formErrors = ref({})
const editMode = ref(false)
const loading = ref(false)

const validationRules = computed(() => ({
  code: [ { required: true, message: t('forms.validation.codeRequired') } ],
  customerName: [ { required: true, message: t('forms.validation.customerNameRequired') } ],
  address: [ { required: true, message: t('forms.validation.addressRequired') } ],
  originProvince: [ { required: true, message: t('forms.validation.originProvinceRequired') } ],
  destinationProvince: [ { required: true, message: t('forms.validation.destinationProvinceRequired') } ]
}))

const statusOptions = computed(() => [
  { label: t('forms.delivery.statusOptions.pending'), value: 'pending' },
  { label: t('forms.delivery.statusOptions.inProgress'), value: 'in_progress' },
  { label: t('forms.delivery.statusOptions.completed'), value: 'completed' },
  { label: t('forms.delivery.statusOptions.cancelled'), value: 'cancelled' }
])

const provinceOptions = [
  { label: 'Lima', value: 'Lima' },
  { label: 'Arequipa', value: 'Arequipa' },
  { label: 'Cusco', value: 'Cusco' },
  { label: 'Trujillo', value: 'Trujillo' },
  { label: 'Chiclayo', value: 'Chiclayo' },
  { label: 'Piura', value: 'Piura' },
  { label: 'Iquitos', value: 'Iquitos' },
  { label: 'Huancayo', value: 'Huancayo' },
  { label: 'Tacna', value: 'Tacna' },
  { label: 'Ica', value: 'Ica' }
]

const assignedDrivers = computed(() => {
  return vehiclesStore.vehicles
    .filter(v => v.currentDriver && (v.status === 'available' || v.status === 'in_use'))
    .map(v => ({
      label: v.currentDriver,
      value: v.currentDriver,
      vehiclePlate: v.licensePlate
    }))
})

const assignedVehicles = computed(() => {
  return vehiclesStore.vehicles
    .filter(v => v.currentDriver && (v.status === 'available' || v.status === 'in_use'))
    .map(v => ({
      label: `${v.licensePlate}`,
      value: v.licensePlate,
      driverName: v.currentDriver
    }))
})

const validateForm = () => {
  const validation = ValidationService.validateForm(form.value, validationRules.value)
  formErrors.value = validation.errors
  return validation.isValid
}

const onDriverChange = (value) => {
  if (value) {
    form.value.driverName = value
    const driver = assignedDrivers.value.find(d => d.value === value)
    if (driver) {
      form.value.vehiclePlate = driver.vehiclePlate
      console.log('Driver selected:', value, 'Vehicle auto-filled:', driver.vehiclePlate)
    }
  }
}

const onVehicleChange = (value) => {
  if (value) {
    form.value.vehiclePlate = value
    const vehicle = assignedVehicles.value.find(v => v.value === value)
    if (vehicle) {
      form.value.driverName = vehicle.driverName
      console.log('Vehicle selected:', value, 'Driver auto-filled:', vehicle.driverName)
    }
  }
}

const save = async () => {
  if (!validateForm()) return
  
  loading.value = true
  try {
    // Log para debugging
    console.log(' Valores del formulario antes de enviar:', {
      originProvince: form.value.originProvince,
      destinationProvince: form.value.destinationProvince,
      status: form.value.status,
      driverName: form.value.driverName,
      vehiclePlate: form.value.vehiclePlate
    })
    
    // Preparar los datos para enviar
    const deliveryData = {
      ...form.value,
      // Convertir etaMinutes de horas a minutos si existe
      etaMinutes: form.value.etaMinutes != null ? Math.round(form.value.etaMinutes * 60) : null
    }
    
    // Eliminar id del objeto antes de enviarlo (va en la URL)
    if (editMode.value) {
      const { id, ...dataWithoutId } = deliveryData
      await deliveriesStore.updateDelivery({ ...dataWithoutId, id })
    } else {
      const { id, ...dataWithoutId } = deliveryData
      await deliveriesStore.addDelivery(dataWithoutId)
    }
    router.push('/deliveries')
  } catch (error) {
    console.error('Error saving delivery:', error)
  } finally {
    loading.value = false
  }
}

const cancel = () => {
  router.push('/deliveries')
}

onMounted(async () => {
  const deliveryId = route.params.id
  if (deliveryId) {
    editMode.value = true
    const delivery = deliveriesStore.deliveries.find(d => d.id == deliveryId)
    if (delivery) {
      form.value = {
        id: delivery.id,
        code: delivery.code,
        customerName: delivery.customerName,
        address: delivery.address,
        originProvince: delivery.originProvince || delivery.origin_province,
        destinationProvince: delivery.destinationProvince || delivery.destination_province,
        status: delivery.status,
        driverName: delivery.driverName,
        vehiclePlate: delivery.vehiclePlate || delivery.vehicle_plate,
        distanceKm: delivery.distanceKm || delivery.distance_km,
        etaMinutes: delivery.etaMinutes != null ? (delivery.etaMinutes / 60) : null
      }
    }
  }
  
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
        {{ editMode ? t('forms.delivery.editDelivery') : t('forms.delivery.newDelivery') }}
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
            <div class="field mb-4">
              <label for="code" class="block mb-2 font-semibold">{{ t('forms.delivery.deliveryCode') }} *</label>
              <pv-input-text 
                id="code" 
                v-model="form.code" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.code }" 
              />
              <small v-if="formErrors.code" class="p-error">{{ formErrors.code }}</small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="customerName" class="block mb-2 font-semibold">{{ t('forms.delivery.customerName') }} *</label>
              <pv-input-text 
                id="customerName" 
                v-model="form.customerName" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.customerName }" 
              />
              <small v-if="formErrors.customerName" class="p-error">{{ formErrors.customerName }}</small>
            </div>
          </div>

          <div class="col-12">
            <div class="field mb-4">
              <label for="address" class="block mb-2 font-semibold">{{ t('forms.delivery.address') }} *</label>
              <pv-input-text 
                id="address" 
                v-model="form.address" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.address }" 
              />
              <small v-if="formErrors.address" class="p-error">{{ formErrors.address }}</small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="originProvince" class="block mb-2 font-semibold">{{ t('forms.delivery.originProvince') }} *</label>
              <pv-select 
                id="originProvince"
                v-model="form.originProvince" 
                :options="provinceOptions" 
                option-label="label" 
                option-value="value" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.originProvince }"
                :placeholder="t('forms.delivery.originProvince')"
              />
              <small v-if="formErrors.originProvince" class="p-error">{{ formErrors.originProvince }}</small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="destinationProvince" class="block mb-2 font-semibold">{{ t('forms.delivery.destinationProvince') }} *</label>
              <pv-select 
                id="destinationProvince"
                v-model="form.destinationProvince" 
                :options="provinceOptions" 
                option-label="label" 
                option-value="value" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.destinationProvince }"
                :placeholder="t('forms.delivery.destinationProvince')"
              />
              <small v-if="formErrors.destinationProvince" class="p-error">{{ formErrors.destinationProvince }}</small>
            </div>
          </div>


          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="status" class="block mb-2 font-semibold">{{ t('forms.delivery.status') }}</label>
              <pv-select 
                id="status"
                v-model="form.status" 
                :options="statusOptions" 
                option-label="label" 
                option-value="value" 
                class="w-full" 
                :placeholder="t('forms.delivery.status')"
              />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="driverName" class="block mb-2 font-semibold">{{ t('forms.delivery.driver') }}</label>
              <pv-select 
                id="driverName"
                v-model="form.driverName" 
                :options="assignedDrivers" 
                option-label="label" 
                option-value="value" 
                class="w-full" 
                :placeholder="t('forms.delivery.assignedDriver')"
                @update:model-value="onDriverChange"
              />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="vehiclePlate" class="block mb-2 font-semibold">{{ t('forms.delivery.vehicle') }}</label>
              <pv-select 
                id="vehiclePlate"
                v-model="form.vehiclePlate" 
                :options="assignedVehicles" 
                option-label="label" 
                option-value="value" 
                class="w-full" 
                :placeholder="t('forms.delivery.assignedVehicle')"
                @update:model-value="onVehicleChange"
              />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="distanceKm" class="block mb-2 font-semibold">{{ t('forms.delivery.distance') }}</label>
              <pv-input-number 
                id="distanceKm" 
                v-model="form.distanceKm" 
                class="w-full" 
                :min="0" 
                :max="10000" 
              />
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="etaMinutes" class="block mb-2 font-semibold">{{ t('forms.delivery.eta') }}</label>
              <pv-input-number 
                id="etaMinutes" 
                v-model="form.etaMinutes" 
                class="w-full" 
                :min="0" 
                :max="1440" 
              />
            </div>
          </div>
        </div>

        <div class="flex justify-content-end gap-2 mt-4">
          <pv-button 
            :label="t('common.cancel')" 
            severity="secondary" 
            @click="cancel" 
          />
          <pv-button 
            :label="editMode ? t('common.update') : t('common.create')" 
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
  color: #000000 !important;
}

:deep(.p-inputtext:focus) {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

:deep(.p-inputtext.p-invalid) {
  border-color: #dc3545;
}

:deep(.p-select),
:deep(.p-dropdown) {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background: #ffffff !important;
  color: #000000 !important;
}

:deep(.p-select-label),
:deep(.p-dropdown-label) {
  background: #ffffff !important;
  color: #000000 !important;
}

:deep(.p-select-trigger),
:deep(.p-dropdown-trigger) {
  background: #ffffff !important;
  color: #000000 !important;
}

:deep(.p-select input),
:deep(.p-dropdown input),
:deep(.p-select .p-select-label),
:deep(.p-dropdown .p-dropdown-label),
:deep(.p-select-value),
:deep(.p-dropdown-value) {
  color: #000000 !important;
}

:deep(.p-select-placeholder),
:deep(.p-dropdown-placeholder) {
  color: #6c757d !important;
}

:deep(.p-select:focus),
:deep(.p-dropdown:focus) {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

:deep(.p-select.p-invalid),
:deep(.p-dropdown.p-invalid) {
  border-color: #dc3545;
}

:deep(.p-calendar) {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #495057;
}

:deep(.p-calendar:focus) {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

:deep(.p-calendar.p-invalid) {
  border-color: #dc3545;
}

:deep(.p-inputnumber) {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #000000 !important;
}

:deep(.p-inputnumber input) {
  color: #000000 !important;
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
