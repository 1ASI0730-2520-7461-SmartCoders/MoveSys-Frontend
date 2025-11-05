<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFuelStore } from '../../application/fuel.store.js'
import { useVehiclesStore } from '../../../fleet-management/application/vehicles.store.js'
import { ValidationService } from '../../../shared/infrastructure/validation.service.js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const store = useFuelStore()
const vehiclesStore = useVehiclesStore()

const dialogVisible = ref(false)
const editMode = ref(false)
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

const availableVehicles = computed(() => {
  // Solo mostrar vehículos que están en ruta (in_use)
  return vehiclesStore.vehicles
    .filter(v => v.status === 'in_use')
    .map(v => ({
      label: `${v.licensePlate}`,
      value: v.id,
      plate: v.licensePlate,
      model: `${v.brand} ${v.model}`,
      odometer: v.mileage
    }))
})

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

const validationRules = {
  selectedVehicle: [{ required: true, message: 'Seleccione un vehículo' }],
  liters: [{ required: true, message: 'Litros requeridos' }, { positive: true, message: 'Debe ser > 0' }],
  costPerLiter: [{ required: true, message: 'Costo por litro requerido' }, { positive: true, message: 'Debe ser > 0' }],
  fuelType: [{ required: true, message: 'Tipo de combustible requerido' }],
  provider: [{ required: true, message: 'Proveedor requerido' }],
}

const fuelTypeOptions = computed(() => [
  { label: t('fuel.types.diesel'), value: 'diesel' },
  { label: t('fuel.types.gasoline'), value: 'gasoline' },
  { label: t('fuel.types.gasolineRegular'), value: 'gasoline-regular' },
  { label: t('fuel.types.gnc'), value: 'gnc' },
])

const validateForm = () => {
  const validation = ValidationService.validateForm(form.value, validationRules)
  formErrors.value = validation.errors
  return validation.isValid
}

const openNew = () => {
  router.push('/fuel-consumption/formulario')
}

const openEdit = (entry) => {
  router.push(`/fuel-consumption/formulario/${entry.id}`)
}

watch(() => form.value.liters, () => {
  if (form.value.liters && form.value.costPerLiter) {
    form.value.totalPaid = form.value.liters * form.value.costPerLiter
  }
})

watch(() => form.value.costPerLiter, () => {
  if (form.value.liters && form.value.costPerLiter) {
    form.value.totalPaid = form.value.liters * form.value.costPerLiter
  }
})

const save = async () => {
  if (!validateForm()) return
  
  if (form.value.liters && form.value.costPerLiter) {
    form.value.totalPaid = form.value.liters * form.value.costPerLiter
  }
  
  if (form.value.filledAt) {
    try {
      const date = new Date(form.value.filledAt)
      if (!isNaN(date.getTime())) {
        form.value.filledAt = date.toISOString()
      }
    } catch (error) {
      console.error('Error converting date:', error)
    }
  }
  
  try {
    if (editMode.value) {
      await store.updateEntry(form.value)
    } else {
      await store.addEntry(form.value)
    }
    dialogVisible.value = false
  } catch (error) {
    console.error('Error saving fuel entry:', error)
  }
}

const deleteEntry = async (id) => {
  try {
    await store.deleteEntry(id)
    await store.fetchEntries()
  } catch (error) {
    console.error('Error deleting fuel entry:', error)
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
  store.fetchEntries()
  vehiclesStore.fetchVehicles()
})
</script>

<template>
  <div class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="text-2xl font-bold">{{ t('navigation.fuelConsumption') }}</h2>
      <pv-button :label="t('fuel.newEntry')" icon="pi pi-plus" @click="openNew" />
    </div>

    <!-- Tabla Principal -->
    <pv-card>
      <template #title>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-list text-purple-500"></i>
          <span>{{ t('fuel.records') }}</span>
        </div>
      </template>
      <template #content>
        <pv-data-table 
          :value="store.filteredEntries" 
          :loading="store.loading" 
          paginator 
          :rows="10" 
          :rows-per-page-options="[5,10,20]"
          scrollable
          scrollHeight="60vh"
        >
          <pv-column field="vehiclePlate" :header="t('fuel.table.vehiclePlate')" sortable />
          <pv-column field="fuelType" :header="t('fuel.table.fuelType')" sortable>
            <template #body="{ data }">
              <pv-tag 
                :value="fuelTypeOptions.find(t => t.value === data.fuelType)?.label || data.fuelType" 
                :severity="data.fuelType === 'diesel' ? 'info' : 'success'" 
              />
            </template>
          </pv-column>
          <pv-column field="liters" :header="t('fuel.table.quantity')" sortable>
            <template #body="{ data }">
              <span class="font-semibold">{{ data.liters }}</span>
            </template>
          </pv-column>
          <pv-column field="costPerLiter" :header="t('fuel.table.costPerLiter')" sortable>
            <template #body="{ data }">
              <span>S/. {{ data.costPerLiter.toFixed(2) }}</span>
            </template>
          </pv-column>
          <pv-column field="totalPaid" :header="t('fuel.table.totalPaid')" sortable>
            <template #body="{ data }">
              <span class="text-green-600 font-semibold">S/. {{ data.totalPaid.toLocaleString('es-PE') }}</span>
            </template>
          </pv-column>
          <pv-column field="provider" :header="t('fuel.table.provider')" sortable />
          <pv-column field="filledAt" :header="t('fuel.table.date')" sortable>
            <template #body="{ data }">
              <span v-if="data.filledAt">
                {{ formatDate(data.filledAt) }}
              </span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </pv-column>
          <pv-column :header="t('fuel.table.actions')" :style="{ width: '120px' }" frozen alignFrozen="right">
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
                  @click="deleteEntry(data.id)" 
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
      :header="editMode ? 'Editar Registro' : 'Nueva Carga'" 
      :style="{ width: '800px' }" 
      :closable="false"
    >
      <div class="flex flex-column gap-3">
        
        <!-- Selección de Vehículo (Patente y Modelo se auto-llenan) -->
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
                placeholder="Seleccione un vehículo"
                @update:model-value="onVehicleSelect"
              />
              <label for="selectedVehicle">Vehículo *</label>
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
              <label for="vehiclePlate">Patente del Vehículo</label>
            </pv-float-label>
          </div>
        </div>

        <!-- Cantidad y Costo por litro -->
        <div class="grid">
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-number 
                id="liters" 
                v-model="form.liters" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.liters }" 
                :min="0" 
                suffix=" L"
              />
              <label for="liters">Cantidad Cargada (L) *</label>
            </pv-float-label>
            <small v-if="formErrors.liters" class="p-error">{{ formErrors.liters }}</small>
          </div>

          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-number 
                id="costPerLiter" 
                v-model="form.costPerLiter" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.costPerLiter }" 
                :min="0" 
                :max="100"
                mode="decimal"
                :minFractionDigits="2"
                :maxFractionDigits="2"
                prefix="S/. "
              />
              <label for="costPerLiter">Costo por Litro (S/.) *</label>
            </pv-float-label>
            <small v-if="formErrors.costPerLiter" class="p-error">{{ formErrors.costPerLiter }}</small>
          </div>
        </div>

          <!-- Total Pagado (calculado automáticamente) -->
        <div class="grid">
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-number 
                id="totalPaid" 
                v-model="form.totalPaid" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.totalPaid }" 
                :min="0" 
                prefix="S/. "
                mode="decimal"
                :minFractionDigits="2"
                :maxFractionDigits="2"
                readonly
                disabled
              />
              <label for="totalPaid">Total Pagado (S/.) * (Calculado automáticamente)</label>
            </pv-float-label>
            <small v-if="formErrors.totalPaid" class="p-error">{{ formErrors.totalPaid }}</small>
          </div>

          <!-- Tipo de Combustible -->
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-select 
                v-model="form.fuelType" 
                :options="fuelTypeOptions" 
                option-label="label" 
                option-value="value" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.fuelType }"
                placeholder="Seleccione tipo de combustible"
              />
              <label for="fuelType">Tipo de Combustible *</label>
            </pv-float-label>
            <small v-if="formErrors.fuelType" class="p-error">{{ formErrors.fuelType }}</small>
          </div>
        </div>

        <!-- Proveedor y Fecha -->
        <div class="grid">
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-text 
                id="provider" 
                v-model="form.provider" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.provider }" 
              />
              <label for="provider">Proveedor/Estación * (ej: Repsol, Primax)</label>
            </pv-float-label>
            <small v-if="formErrors.provider" class="p-error">{{ formErrors.provider }}</small>
          </div>

          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-text 
                id="filledAt" 
                v-model="form.filledAt" 
                type="datetime-local" 
                class="w-full" 
              />
              <label for="filledAt">Fecha y Hora</label>
            </pv-float-label>
          </div>
        </div>

        <!-- Odómetro -->
        <div class="grid">
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-number 
                id="odometer" 
                v-model="form.odometer" 
                class="w-full" 
                :min="0" 
                suffix=" km"
              />
              <label for="odometer">Odómetro (km)</label>
            </pv-float-label>
          </div>
        </div>

        <!-- Notas -->
        <pv-float-label>
          <pv-textarea id="notes" v-model="form.notes" class="w-full" rows="3" />
          <label for="notes">Notas Adicionales</label>
        </pv-float-label>

        <!-- Resumen del cálculo -->
        <div v-if="form.liters > 0 && form.costPerLiter > 0" class="p-3 border-1 border-200 border-round bg-blue-50">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-info-circle text-blue-500"></i>
            <span class="font-semibold">Total Calculado: S/. {{ (form.totalPaid || 0).toFixed(2) }}</span>
          </div>
          <small class="text-gray-600">({{ form.liters }} L × S/. {{ form.costPerLiter }} = S/. {{ (form.totalPaid || 0).toFixed(2) }})</small>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-content-end gap-2">
          <pv-button label="Cancelar" severity="secondary" text @click="dialogVisible = false" />
          <pv-button label="Guardar" icon="pi pi-save" @click="save" />
        </div>
      </template>
    </pv-dialog>
  </div>
</template>

<style scoped>

</style>
