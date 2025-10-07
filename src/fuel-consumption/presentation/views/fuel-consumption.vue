<script setup>
import { onMounted, ref, computed } from 'vue'
import { useFuelStore } from '../../application/fuel.store.js'
import { useVehiclesStore } from '../../../fleet-management/application/vehicles.store.js'
import { ValidationService } from '../../../shared/infrastructure/validation.service.js'

const store = useFuelStore()
const vehiclesStore = useVehiclesStore()

const dialogVisible = ref(false)
const editMode = ref(false)
const form = ref({ vehicleId: null, vehiclePlate: '', liters: 0, cost: 0, fuelType: 'diesel', station: '', filledAt: '', odometer: null, notes: '' })
const formErrors = ref({})

// Cantidades de referencia para facilitar el registro
const referenceAmounts = ref([50, 100, 150, 200, 250, 300, 400, 500])
const referenceCosts = ref([50, 100, 150, 200, 250, 300, 400, 500])

const validationRules = {
  vehiclePlate: [ { required: true, message: 'Patente requerida' } ],
  liters: [ { required: true, message: 'Litros requeridos' }, { positive: true, message: 'Debe ser > 0' } ],
  cost: [ { required: true, message: 'Costo requerido' }, { positive: true, message: 'Debe ser > 0' } ],
}

// Computed properties para KPIs
const totalLiters = computed(() => store.entries.reduce((acc, e) => acc + (Number(e.liters) || 0), 0))
const totalCost = computed(() => store.entries.reduce((acc, e) => acc + (Number(e.cost) || 0), 0))
const avgCostPerLiter = computed(() => totalLiters.value ? (totalCost.value / totalLiters.value) : 0)
const totalEntries = computed(() => store.entries.length)
const avgLitersPerEntry = computed(() => totalEntries.value ? (totalLiters.value / totalEntries.value) : 0)

// Análisis por vehículo
const fuelByVehicle = computed(() => {
  const map = new Map()
  for (const e of store.entries) {
    const plate = e.vehiclePlate || 'N/D'
    const prev = map.get(plate) || { vehiclePlate: plate, liters: 0, cost: 0, entries: 0 }
    prev.liters += Number(e.liters) || 0
    prev.cost += Number(e.cost) || 0
    prev.entries += 1
    map.set(plate, prev)
  }
  return Array.from(map.values()).sort((a, b) => b.liters - a.liters)
})

// Análisis por tipo de combustible
const fuelByType = computed(() => {
  const map = new Map()
  for (const e of store.entries) {
    const type = e.fuelType || 'diesel'
    const prev = map.get(type) || { fuelType: type, liters: 0, cost: 0, entries: 0 }
    prev.liters += Number(e.liters) || 0
    prev.cost += Number(e.cost) || 0
    prev.entries += 1
    map.set(type, prev)
  }
  return Array.from(map.values()).sort((a, b) => b.liters - a.liters)
})

// Entradas recientes (últimas 5)
const recentEntries = computed(() => {
  return store.entries
    .sort((a, b) => new Date(b.filledAt || 0) - new Date(a.filledAt || 0))
    .slice(0, 5)
})

const validateForm = () => {
  const validation = ValidationService.validateForm(form.value, validationRules)
  formErrors.value = validation.errors
  return validation.isValid
}

const openNew = () => {
  editMode.value = false
  form.value = { vehicleId: null, vehiclePlate: '', liters: 0, cost: 0, fuelType: 'diesel', station: '', filledAt: '', odometer: null, notes: '' }
  formErrors.value = {}
  dialogVisible.value = true
}

const openEdit = (entry) => {
  editMode.value = true
  form.value = { ...entry }
  formErrors.value = {}
  dialogVisible.value = true
}

const save = async () => {
  if (!validateForm()) return
  
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
  } catch (error) {
    console.error('Error deleting fuel entry:', error)
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
      <h2 class="text-2xl font-bold">Consumo de Combustible</h2>
      <pv-button label="Nueva Carga" icon="pi pi-plus" @click="openNew" />
    </div>



    <!-- Análisis por Tipo de Combustible -->
    <pv-card class="mb-4">
      <template #title>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-chart-pie text-green-500"></i>
          <span>Consumo por Tipo</span>
        </div>
      </template>
      <template #content>
        <div class="grid">
          <div v-for="type in fuelByType" :key="type.fuelType" class="col-12 md:col-6 lg:col-3">
            <div class="border-1 border-200 border-round p-3">
              <div class="flex justify-content-between align-items-center mb-2">
                <span class="font-semibold">{{ type.fuelType }}</span>
                <pv-tag :value="type.entries" severity="success" />
              </div>
              <div class="text-sm text-gray-600">{{ type.liters.toFixed(1) }} L</div>
              <div class="text-sm text-green-600 font-semibold">${{ type.cost.toFixed(2) }}</div>
            </div>
          </div>
        </div>
      </template>
    </pv-card>

    <!-- Filtros -->

    <!-- Tabla Principal -->
    <pv-card>
      <template #title>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-list text-purple-500"></i>
          <span>Registros de Combustible</span>
        </div>
      </template>
      <template #content>
        <pv-data-table :value="store.filteredEntries" :loading="store.loading" paginator :rows="10" :rows-per-page-options="[5,10,20]">
          <pv-column field="vehiclePlate" header="Patente" sortable />
          <pv-column field="liters" header="Litros" sortable>
            <template #body="{ data }">
              <div class="flex align-items-center gap-2">
                <i class="pi pi-circle-fill text-blue-500" style="font-size: 0.5rem"></i>
                <span>{{ data.liters }} L</span>
              </div>
            </template>
          </pv-column>
          <pv-column field="cost" header="Costo" sortable>
            <template #body="{ data }">
              <span class="text-green-600 font-semibold">${{ data.cost }}</span>
            </template>
          </pv-column>
          <pv-column field="fuelType" header="Combustible" sortable>
            <template #body="{ data }">
              <pv-tag :value="data.fuelType" :severity="data.fuelType === 'diesel' ? 'info' : 'success'" />
            </template>
          </pv-column>
          <pv-column field="station" header="Estación" />
          <pv-column field="filledAt" header="Fecha" sortable>
            <template #body="{ data }">
              <span v-if="data.filledAt">{{ new Date(data.filledAt).toLocaleString() }}</span>
              <span v-else class="text-gray-400">-</span>
            </template>
          </pv-column>
          <pv-column header="Acciones" :style="{ width: '120px' }">
            <template #body="{ data }">
              <div class="flex gap-1">
                <pv-button icon="pi pi-pencil" size="small" text rounded severity="info" @click="openEdit(data)" v-tooltip.top="$t('common.edit')" />
                <pv-button icon="pi pi-trash" size="small" text rounded severity="danger" @click="deleteEntry(data.id)" v-tooltip.top="$t('common.delete')" />
              </div>
            </template>
          </pv-column>
        </pv-data-table>
      </template>
    </pv-card>

    <pv-dialog v-model:visible="dialogVisible" modal :header="editMode ? 'Editar Registro' : 'Nueva Carga'" :style="{ width: '700px' }" :closable="false">
      <div class="flex flex-column gap-3">
        <!-- Vehículo -->
        <pv-float-label>
          <pv-input-text id="vehiclePlate" v-model="form.vehiclePlate" class="w-full" :class="{ 'p-invalid': formErrors.vehiclePlate }" />
          <label for="vehiclePlate">Patente del Vehículo *</label>
        </pv-float-label>
        <small v-if="formErrors.vehiclePlate" class="p-error">{{ formErrors.vehiclePlate }}</small>

        <!-- Litros y Costo -->
        <div class="grid">
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-number id="liters" v-model="form.liters" class="w-full" :class="{ 'p-invalid': formErrors.liters }" :min="0" :max="1000" />
              <label for="liters">Litros *</label>
            </pv-float-label>
            <small v-if="formErrors.liters" class="p-error">{{ formErrors.liters }}</small>
            
            <!-- Cantidades de referencia -->
            <div class="mt-2">
              <small class="text-gray-500 mb-2 block">Cantidades de referencia:</small>
              <div class="flex flex-wrap gap-1">
                <pv-button 
                  v-for="ref in referenceAmounts" 
                  :key="ref"
                  :label="`${ref}L`" 
                  size="small" 
                  severity="secondary" 
                  text 
                  @click="form.liters = ref"
                  class="text-xs"
                />
              </div>
            </div>
          </div>
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-number id="cost" v-model="form.cost" class="w-full" :class="{ 'p-invalid': formErrors.cost }" :min="0" :max="10000" mode="currency" currency="USD" />
              <label for="cost">Costo *</label>
            </pv-float-label>
            <small v-if="formErrors.cost" class="p-error">{{ formErrors.cost }}</small>
            
            <!-- Costos de referencia -->
            <div class="mt-2">
              <small class="text-gray-500 mb-2 block">Costos de referencia:</small>
              <div class="flex flex-wrap gap-1">
                <pv-button 
                  v-for="ref in referenceCosts" 
                  :key="ref"
                  :label="`$${ref}`" 
                  size="small" 
                  severity="secondary" 
                  text 
                  @click="form.cost = ref"
                  class="text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Tipo de Combustible y Estación -->
        <div class="grid">
          <div class="col-12 md:col-6">
            <pv-select 
              v-model="form.fuelType" 
              :options="[
                { label: 'Diésel', value: 'diesel' },
                { label: 'Gasolina', value: 'gasoline' },
                { label: 'Eléctrico', value: 'electric' },
                { label: 'Híbrido', value: 'hybrid' }
              ]" 
              option-label="label" 
              option-value="value" 
              class="w-full" 
              placeholder="Tipo de combustible"
            />
          </div>
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-text id="station" v-model="form.station" class="w-full" />
              <label for="station">Estación de Servicio</label>
            </pv-float-label>
          </div>
        </div>

        <!-- Fecha y Odómetro -->
        <div class="grid">
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-text id="filledAt" v-model="form.filledAt" type="datetime-local" class="w-full" />
              <label for="filledAt">Fecha y Hora</label>
            </pv-float-label>
          </div>
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-number id="odometer" v-model="form.odometer" class="w-full" :min="0" />
              <label for="odometer">Odómetro (km)</label>
            </pv-float-label>
          </div>
        </div>

        <!-- Notas -->
        <pv-float-label>
          <pv-textarea id="notes" v-model="form.notes" class="w-full" rows="3" />
          <label for="notes">Notas Adicionales</label>
        </pv-float-label>

        <!-- Resumen del costo por litro -->
        <div v-if="form.liters > 0 && form.cost > 0" class="p-3 border-1 border-200 border-round bg-blue-50">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-info-circle text-blue-500"></i>
            <span class="font-semibold">Costo por litro: ${{ (form.cost / form.liters).toFixed(2) }}</span>
          </div>
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
