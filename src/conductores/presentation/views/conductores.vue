<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useConductoresStore } from '../../application/conductores.store.js'
import { Conductor } from '../../domain/conductor.entity.js'
import { ValidationService } from '../../../shared/infrastructure/validation.service.js'
import { useConfirm } from 'primevue/useconfirm'

const { t } = useI18n()

const router = useRouter()
const store = useConductoresStore()
const { 
  conductores, 
  loading, 
  errors, 
  searchQuery,
  selectedRole,
  selectedStatus,
  filteredConductores,
  roleOptions,
  statusOptions,
  fetchConductores, 
  addConductor, 
  updateConductor, 
  deleteConductor,
  searchConductores,
  updateConductorStatus,
  setSearchQuery,
  setSelectedRole,
  setSelectedStatus,
  clearFilters
} = store

const confirm = useConfirm()

const dialogVisible = ref(false)
const editMode = ref(false)
const form = ref(new Conductor({}))
const formErrors = ref({})

const validationRules = {
  firstName: [
    { required: true, message: t('forms.validation.firstNameRequired') },
    { minLength: 2, message: t('forms.validation.firstNameMinLength') }
  ],
  lastName: [
    { required: true, message: t('forms.validation.lastNameRequired') },
    { minLength: 2, message: t('forms.validation.lastNameMinLength') }
  ],
  dni: [
    { required: true, message: t('forms.validation.dniRequired') },
    { minLength: 6, message: t('forms.validation.dniMinLength') }
  ],
  phoneNumber: [
    { required: true, message: t('forms.validation.phoneRequired') },
    { phone: true, message: t('forms.validation.phoneValid') }
  ],
  role: []
}

onMounted(() => {
  if (!conductores.length) fetchConductores()
})

watch(() => searchQuery.value, (newQuery) => {
  if (newQuery) {
    searchConductores(newQuery)
  } else {
    fetchConductores()
  }
})

const openNew = () => {
  router.push('/conductores/formulario')
}

const openEdit = (conductor) => {
  router.push(`/conductores/formulario/${conductor.id}`)
}

const validateForm = () => {
  const validation = ValidationService.validateForm(form.value, validationRules)
  formErrors.value = validation.errors
  return validation.isValid
}

const save = async () => {
  if (!validateForm()) return

  try {
    if (editMode.value) {
      await updateConductor(form.value)
    } else {
    await addConductor(form.value)
    }
    dialogVisible.value = false
  } catch (error) {
    console.error('Error saving conductor:', error)
  }
}

const confirmDelete = (conductor) => {
  confirm.require({
    message: t('users.confirmDelete', { name: conductor.fullName }),
    header: t('users.confirmDeleteHeader'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteConductor(conductor.id)
  })
}

const toggleConductorStatus = async (conductor) => {
  const newStatus = conductor.status === 'active' ? 'inactive' : 'active'
  await updateConductorStatus(conductor.id, newStatus)
}

const getStatusSeverity = (status) => {
  const severities = {
    'active': 'success',
    'inactive': 'secondary',
    'suspended': 'danger'
  }
  return severities[status] || 'secondary'
}

const getStatusLabel = (status) => {
  const labels = {
    'active': t('forms.user.statusOptions.active'),
    'inactive': t('forms.user.statusOptions.inactive'),
    'suspended': t('forms.user.statusOptions.suspended')
  }
  return labels[status] || status
}
</script>

<template>
  <div class="p-4">
    <!-- Header -->
    <div class="flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Conductores</h1>
        <p class="text-gray-600">Gestión de conductores del sistema</p>
      </div>
      <pv-button 
        label="Nuevo Conductor" 
        icon="pi pi-plus" 
        @click="openNew" 
      />
    </div>

    <!-- Data Table -->
    <div class="card">
      <pv-data-table 
        :value="filteredConductores" 
        :loading="loading" 
        striped-rows 
        table-style="min-width: 50rem"
        paginator
        :rows="10"
        :rows-per-page-options="[5, 10, 20, 50]"
        sort-field="id"
        :sort-order="-1"
        removable-sort
      >
        <template #header>
          <div class="flex justify-content-between align-items-center">
            <span class="text-lg font-semibold">Lista de Conductores</span>
            <span class="text-sm text-gray-600">{{ filteredConductores.length }} conductores encontrados</span>
          </div>
        </template>

        <pv-column field="fullName" header="Nombre Completo" sortable>
          <template #body="slotProps">
            <div class="font-semibold">{{ slotProps.data.fullName }}</div>
          </template>
        </pv-column>

        <pv-column field="phoneNumber" header="Teléfono" sortable />
        <pv-column field="dni" header="DNI" sortable />

        <pv-column field="role" header="Rol" sortable>
          <template #body="slotProps">
            <pv-tag :value="slotProps.data.roleDisplayName" severity="info" />
          </template>
        </pv-column>

        <pv-column field="status" header="Estado" sortable>
          <template #body="slotProps">
            <pv-tag 
              :value="getStatusLabel(slotProps.data.status)" 
              :severity="getStatusSeverity(slotProps.data.status)"
            />
          </template>
        </pv-column>

        <pv-column header="Acciones" :style="{ width: '200px' }">
          <template #body="slotProps">
            <div class="flex gap-1">
              <pv-button 
                icon="pi pi-pencil" 
                size="small"
                text 
                rounded 
                severity="info"
                @click="openEdit(slotProps.data)" 
                v-tooltip.top="t('common.edit')"
              />
              <pv-button 
                icon="pi pi-trash" 
                size="small"
                text 
                rounded 
                severity="danger"
                @click="confirmDelete(slotProps.data)" 
                v-tooltip.top="t('common.delete')"
              />
            </div>
          </template>
        </pv-column>
      </pv-data-table>
    </div>

    <!-- Error Messages -->
    <div v-if="errors.length" class="mt-3">
      <pv-message 
        v-for="(error, index) in errors" 
        :key="index"
        severity="error" 
        :closable="false"
        class="mb-2"
      >
        {{ error }}
      </pv-message>
    </div>

    <!-- Confirm Dialog -->
    <pv-confirm-dialog />
  </div>
</template>

<style scoped>
</style>


