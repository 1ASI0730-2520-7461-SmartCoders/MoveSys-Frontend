<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMaintenanceStore } from '../../application/maintenance.store.js'
import { useVehiclesStore } from '../../../fleet-management/application/vehicles.store.js'
import { ValidationService } from '../../../shared/infrastructure/validation.service.js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const router = useRouter()
const store = useMaintenanceStore()
const vehiclesStore = useVehiclesStore()

const dialogVisible = ref(false)
const editMode = ref(false)
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
const addingPart = ref(false)
const newPart = ref({ name: '', cost: 0, quantity: 1 })

const availableVehicles = computed(() => {
  return vehiclesStore.vehicles
    .filter(v => v.status === 'available' || v.status === 'in_use' || v.status === 'maintenance')
    .map(v => ({
      label: `${v.licensePlate} - ${v.brand} ${v.model}`,
      value: v.id,
      plate: v.licensePlate,
      model: `${v.brand} ${v.model}`,
      mileage: v.mileage
    }))
})

const validationRules = {
  selectedVehicle: [{ required: true, message: 'Seleccione un vehículo' }],
  maintenanceType: [{ required: true, message: 'Tipo de mantenimiento requerido' }],
  description: [{ required: true, message: 'Descripción requerida' }],
  cost: [{ required: true, message: 'Costo requerido' }, { positive: true, message: 'Debe ser > 0' }],
  provider: [{ required: true, message: 'Proveedor requerido' }],
}

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

const validateForm = () => {
  const validation = ValidationService.validateForm(form.value, validationRules)
  formErrors.value = validation.errors
  return validation.isValid
}

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

const openNew = () => {
  router.push('/maintenance/formulario')
}

const openEdit = (record) => {
  router.push(`/maintenance/formulario/${record.id}`)
}

const addPart = () => {
  if (newPart.value.name && newPart.value.cost > 0) {
    form.value.parts.push({ ...newPart.value })
    newPart.value = { name: '', cost: 0, quantity: 1 }
    addingPart.value = false
  }
}

const removePart = (index) => {
  form.value.parts.splice(index, 1)
}

const save = async () => {
  if (!validateForm()) return
  
  if (form.value.maintenanceDate) {
    try {
      const date = new Date(form.value.maintenanceDate)
      if (!isNaN(date.getTime())) {
        form.value.maintenanceDate = date.toISOString()
      }
    } catch (error) {
      console.error('Error converting date:', error)
    }
  }
  
  if (form.value.nextMaintenanceDate) {
    try {
      const date = new Date(form.value.nextMaintenanceDate)
      if (!isNaN(date.getTime())) {
        form.value.nextMaintenanceDate = date.toISOString()
      }
    } catch (error) {
      console.error('Error converting next date:', error)
    }
  }
  
  try {
    if (editMode.value) {
      await store.updateRecord(form.value)
    } else {
      await store.addRecord(form.value)
    }
    dialogVisible.value = false
  } catch (error) {
    console.error('Error saving maintenance:', error)
  }
}

const deleteRecord = async (id) => {
  try {
    await store.deleteRecord(id)
    await store.fetchRecords()
  } catch (error) {
    console.error('Error deleting maintenance:', error)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-PE', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    })
  } catch (error) {
    return dateString
  }
}

onMounted(() => {
  store.fetchRecords()
  vehiclesStore.fetchVehicles()
})
</script>

<template>
  <div class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="text-2xl font-bold">{{ t('maintenance.title') }}</h2>
      <pv-button :label="t('maintenance.newMaintenance')" icon="pi pi-plus" @click="openNew" />
    </div>

    <!-- Tabla Principal -->
    <pv-card>
      <template #title>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-wrench text-purple-500"></i>
          <span>{{ t('maintenance.maintenanceRecords') }}</span>
        </div>
      </template>
      <template #content>
        <pv-data-table 
          :value="store.filteredRecords" 
          :loading="store.loading" 
          paginator 
          :rows="10" 
          :rows-per-page-options="[5,10,20]"
          scrollable
          scrollHeight="60vh"
        >
          <pv-column field="vehiclePlate" :header="t('maintenance.table.vehicle')" sortable />
          <pv-column field="maintenanceType" :header="t('maintenance.table.type')" sortable>
            <template #body="{ data }">
              <pv-tag 
                :value="maintenanceTypeOptions.find(t => t.value === data.maintenanceType)?.label || data.maintenanceType" 
                :severity="data.maintenanceType === 'preventive' ? 'success' : data.maintenanceType === 'corrective' ? 'warning' : 'danger'" 
              />
            </template>
          </pv-column>
          <pv-column field="description" :header="t('maintenance.table.description')" sortable />
          <pv-column field="cost" :header="t('maintenance.table.cost')" sortable>
            <template #body="{ data }">
              <span class="text-green-600 font-semibold">S/. {{ data.cost.toLocaleString('es-PE') }}</span>
            </template>
          </pv-column>
          <pv-column field="maintenanceDate" :header="t('maintenance.table.date')" sortable>
            <template #body="{ data }">
              <span v-if="data.maintenanceDate">
                {{ formatDate(data.maintenanceDate) }}
              </span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </pv-column>
          <pv-column field="status" :header="t('maintenance.table.status')" sortable>
            <template #body="{ data }">
              <pv-tag 
                :value="statusOptions.find(s => s.value === data.status)?.label || data.status" 
                :severity="data.status === 'completed' ? 'success' : data.status === 'in_progress' ? 'info' : data.status === 'cancelled' ? 'danger' : 'warning'" 
              />
            </template>
          </pv-column>
          <pv-column :header="t('maintenance.table.actions')" :style="{ width: '120px' }" frozen alignFrozen="right">
            <template #body="{ data }">
              <div class="flex gap-1">
                <pv-button 
                  icon="pi pi-pencil" 
                  size="small" 
                  text 
                  rounded 
                  severity="info" 
                  @click="openEdit(data)" 
                  v-tooltip.top="$t('common.edit')" 
                />
                <pv-button 
                  icon="pi pi-trash" 
                  size="small" 
                  text 
                  rounded 
                  severity="danger" 
                  @click="deleteRecord(data.id)" 
                  v-tooltip.top="$t('common.delete')" 
                />
              </div>
            </template>
          </pv-column>
        </pv-data-table>
      </template>
    </pv-card>

    <!-- Dialog para Crear/Editar -->
    <pv-dialog 
      v-model:visible="dialogVisible" 
      modal 
      :header="editMode ? $t('common.edit') + ' Mantenimiento' : t('maintenance.newMaintenance')" 
      :style="{ width: '900px' }" 
      :closable="false"
    >
      <div class="flex flex-column gap-3">
        
        <!-- Selección de Vehículo -->
        <div class="grid">
          <div class="col-12">
            <pv-float-label>
              <pv-select
                id="selectedVehicle"
                v-model="form.selectedVehicle"
                :options="availableVehicles"
                option-label="label"
                option-value="value"
                class="w-full"
                :class="{ 'p-invalid': formErrors.selectedVehicle }"
                :placeholder="t('maintenance.form.selectVehicle')"
                @update:model-value="onVehicleSelect"
              />
              <label for="selectedVehicle">{{ t('maintenance.form.vehicle') }} *</label>
            </pv-float-label>
            <small v-if="formErrors.selectedVehicle" class="p-error">{{ formErrors.selectedVehicle }}</small>
          </div>
        </div>

        <!-- Información del Vehículo (solo lectura) -->
        <div class="grid">
          <div class="col-12">
            <pv-float-label>
              <pv-input-text 
                id="vehiclePlate" 
                v-model="form.vehiclePlate" 
                class="w-full"
                readonly
                disabled
              />
              <label for="vehiclePlate">{{ t('maintenance.form.vehiclePlate') }}</label>
            </pv-float-label>
          </div>
        </div>

        <!-- Tipo y Estado -->
        <div class="grid">
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-select
                v-model="form.maintenanceType"
                :options="maintenanceTypeOptions"
                option-label="label"
                option-value="value"
                class="w-full"
                :class="{ 'p-invalid': formErrors.maintenanceType }"
              />
              <label for="maintenanceType">{{ t('maintenance.form.maintenanceType') }} *</label>
            </pv-float-label>
            <small v-if="formErrors.maintenanceType" class="p-error">{{ formErrors.maintenanceType }}</small>
          </div>

          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-select
                v-model="form.status"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                class="w-full"
              />
              <label for="status">{{ t('maintenance.form.status') }}</label>
            </pv-float-label>
          </div>
        </div>

        <!-- Descripción -->
        <pv-float-label>
          <pv-textarea 
            id="description" 
            v-model="form.description" 
            class="w-full" 
            rows="3"
            :class="{ 'p-invalid': formErrors.description }"
          />
          <label for="description">{{ t('maintenance.form.description') }} *</label>
        </pv-float-label>
        <small v-if="formErrors.description" class="p-error">{{ formErrors.description }}</small>

        <!-- Costo y Kilometraje -->
        <div class="grid">
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-number 
                id="cost" 
                v-model="form.cost" 
                class="w-full" 
                :min="0" 
                prefix="S/. "
                mode="decimal"
                :minFractionDigits="2"
                :maxFractionDigits="2"
              />
              <label for="cost">{{ t('maintenance.form.cost') }} *</label>
            </pv-float-label>
            <small v-if="formErrors.cost" class="p-error">{{ formErrors.cost }}</small>
          </div>

          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-number 
                id="mileage" 
                v-model="form.mileage" 
                class="w-full" 
                :min="0" 
                suffix=" km"
              />
              <label for="mileage">{{ t('maintenance.form.mileage') }}</label>
            </pv-float-label>
          </div>
        </div>

        <!-- Fechas -->
        <div class="grid">
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-text 
                id="maintenanceDate" 
                v-model="form.maintenanceDate" 
                type="date" 
                class="w-full" 
              />
              <label for="maintenanceDate">{{ t('maintenance.form.maintenanceDate') }}</label>
            </pv-float-label>
          </div>

          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-text 
                id="nextMaintenanceDate" 
                v-model="form.nextMaintenanceDate" 
                type="date" 
                class="w-full" 
              />
              <label for="nextMaintenanceDate">{{ t('maintenance.form.nextMaintenanceDate') }}</label>
            </pv-float-label>
          </div>
        </div>

        <!-- Proveedor y Mecánico -->
        <div class="grid">
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-text 
                id="provider" 
                v-model="form.provider" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.provider }" 
              />
              <label for="provider">{{ t('maintenance.form.provider') }} *</label>
            </pv-float-label>
            <small v-if="formErrors.provider" class="p-error">{{ formErrors.provider }}</small>
          </div>

          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-text 
                id="mechanic" 
                v-model="form.mechanic" 
                class="w-full" 
              />
              <label for="mechanic">{{ t('maintenance.form.mechanic') }}</label>
            </pv-float-label>
          </div>
        </div>

        <!-- Repuestos -->
        <div class="border-1 border-200 border-round p-3">
          <div class="flex justify-content-between align-items-center mb-2">
            <label class="font-semibold">{{ t('maintenance.form.parts') }}</label>
            <pv-button 
              :label="t('maintenance.form.addPart')" 
              icon="pi pi-plus" 
              size="small"
              @click="addingPart = true"
            />
          </div>

          <div v-if="addingPart" class="grid mb-2">
            <div class="col-12 md:col-5">
              <pv-input-text v-model="newPart.name" :placeholder="t('maintenance.form.partName')" class="w-full" />
            </div>
            <div class="col-12 md:col-3">
              <pv-input-number v-model="newPart.quantity" :placeholder="t('maintenance.form.quantity')" :min="1" class="w-full" />
            </div>
            <div class="col-12 md:col-3">
              <pv-input-number v-model="newPart.cost" :placeholder="t('maintenance.form.partCost')" prefix="S/. " :min="0" class="w-full" />
            </div>
            <div class="col-12 md:col-1">
              <pv-button icon="pi pi-check" text @click="addPart" />
              <pv-button icon="pi pi-times" text severity="danger" @click="addingPart = false" />
            </div>
          </div>

          <div v-for="(part, index) in form.parts" :key="index" class="flex justify-content-between align-items-center mb-2 p-2 border-1 border-200 border-round">
            <div>
              <strong>{{ part.name }}</strong> - {{ t('maintenance.form.quantity') }}: {{ part.quantity }} - {{ t('maintenance.form.partCost') }}: S/. {{ part.cost }}
            </div>
            <pv-button icon="pi pi-trash" size="small" text severity="danger" @click="removePart(index)" />
          </div>
        </div>

        <!-- Notas -->
        <pv-float-label>
          <pv-textarea id="notes" v-model="form.notes" class="w-full" rows="3" />
          <label for="notes">{{ t('maintenance.form.notes') }}</label>
        </pv-float-label>

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
