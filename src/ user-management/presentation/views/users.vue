<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUsersStore } from '../../application/users.store.js'
import { User } from '../../domain/user.entity.js'
import { ValidationService } from '../../../shared/infrastructure/validation.service.js'
import { useConfirm } from 'primevue/useconfirm'

const { t } = useI18n()

const router = useRouter()
const store = useUsersStore()
const { 
  users, 
  loading, 
  errors, 
  searchQuery,
  selectedRole,
  selectedStatus,
  filteredUsers,
  roleOptions,
  statusOptions,
  fetchUsers, 
  addUser, 
  updateUser, 
  deleteUser,
  searchUsers,
  updateUserStatus,
  setSearchQuery,
  setSelectedRole,
  setSelectedStatus,
  clearFilters
} = store

const confirm = useConfirm()

const dialogVisible = ref(false)
const editMode = ref(false)
const form = ref(new User({}))
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
  if (!users.length) fetchUsers()
})

watch(searchQuery, (newQuery) => {
  if (newQuery) {
    searchUsers(newQuery)
  } else {
    fetchUsers()
  }
})

const openNew = () => {
  router.push('/users/formulario')
}

const openEdit = (user) => {
  router.push(`/users/formulario/${user.id}`)
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
      await updateUser(form.value)
    } else {
    await addUser(form.value)
    }
    dialogVisible.value = false
  } catch (error) {
    console.error('Error saving user:', error)
  }
}

const confirmDelete = (user) => {
  confirm.require({
    message: t('users.confirmDelete', { name: user.fullName }),
    header: t('users.confirmDeleteHeader'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteUser(user.id)
  })
}

const toggleUserStatus = async (user) => {
  const newStatus = user.status === 'active' ? 'inactive' : 'active'
  await updateUserStatus(user.id, newStatus)
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
        <h1 class="text-2xl font-bold text-gray-800 mb-2">{{ t('users.title') }}</h1>
        <p class="text-gray-600">{{ t('users.subtitle') }}</p>
      </div>
      <pv-button 
        :label="t('users.newUser')" 
        icon="pi pi-plus" 
        @click="openNew" 
      />
    </div>


    <!-- Statistics Cards -->
    <div class="grid mb-4">
      <div class="col-12 md:col-3">
        <div class="card text-center">
          <div class="p-3">
            <i class="pi pi-users text-4xl text-blue-500 mb-2"></i>
            <div class="text-2xl font-bold">{{ users.length }}</div>
            <div class="text-sm text-gray-600">{{ t('users.stats.total') }}</div>
          </div>
        </div>
      </div>
      <div class="col-12 md:col-3">
        <div class="card text-center">
          <div class="p-3">
            <i class="pi pi-check-circle text-4xl text-green-500 mb-2"></i>
            <div class="text-2xl font-bold">{{ users.filter(u => u.isActive).length }}</div>
            <div class="text-sm text-gray-600">{{ t('users.stats.active') }}</div>
          </div>
        </div>
      </div>
      <div class="col-12 md:col-3">
        <div class="card text-center">
          <div class="p-3">
            <i class="pi pi-times-circle text-4xl text-red-500 mb-2"></i>
            <div class="text-2xl font-bold">{{ users.filter(u => !u.isActive).length }}</div>
            <div class="text-sm text-gray-600">{{ t('users.stats.inactive') }}</div>
          </div>
        </div>
      </div>
      <div class="col-12 md:col-3">
        <div class="card text-center">
          <div class="p-3">
            <i class="pi pi-filter text-4xl text-purple-500 mb-2"></i>
            <div class="text-2xl font-bold">{{ filteredUsers.length }}</div>
            <div class="text-sm text-gray-600">{{ t('users.stats.filtered') }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card">
      <pv-data-table 
        :value="filteredUsers" 
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
            <span class="text-lg font-semibold">{{ t('users.userList') }}</span>
            <span class="text-sm text-gray-600">{{ t('users.usersFound', { count: filteredUsers.length }) }}</span>
          </div>
        </template>

        <pv-column field="id" :header="t('users.table.id')" sortable :style="{ width: '80px' }">
          <template #body="slotProps">
            <pv-tag :value="slotProps.data.id" severity="info" />
          </template>
        </pv-column>

        <pv-column field="fullName" :header="t('users.table.fullName')" sortable>
          <template #body="slotProps">
            <div class="flex align-items-center gap-2">
              <pv-avatar 
                :label="slotProps.data.firstName.charAt(0) + slotProps.data.lastName.charAt(0)" 
                shape="circle" 
                size="small"
              />
              <div>
                <div class="font-semibold">{{ slotProps.data.fullName }}</div>
                <div class="text-sm text-gray-600">{{ t('users.table.dni') }}: {{ slotProps.data.dni }}</div>
              </div>
            </div>
          </template>
        </pv-column>

        <pv-column field="phoneNumber" :header="t('users.table.phone')" sortable />
        <pv-column field="dni" :header="t('users.table.dni')" sortable />

        <pv-column field="role" :header="t('users.table.role')" sortable>
          <template #body="slotProps">
            <pv-tag :value="slotProps.data.roleDisplayName" severity="info" />
          </template>
        </pv-column>

        <pv-column field="status" :header="t('users.table.status')" sortable>
          <template #body="slotProps">
            <pv-tag 
              :value="getStatusLabel(slotProps.data.status)" 
              :severity="getStatusSeverity(slotProps.data.status)"
            />
          </template>
        </pv-column>

        

        <pv-column :header="t('common.actions')" :style="{ width: '200px' }">
          <template #body="slotProps">
            <div class="flex gap-1">
              <pv-button 
                icon="pi pi-pencil" 
                size="small"
                text 
                rounded 
                severity="secondary"
                @click="openEdit(slotProps.data)" 
                v-tooltip.top="t('common.edit')"
              />
              <pv-button 
                :icon="slotProps.data.isActive ? 'pi pi-eye-slash' : 'pi pi-eye'" 
                size="small"
                text 
                rounded 
                severity="secondary"
                @click="toggleUserStatus(slotProps.data)" 
                :v-tooltip.top="slotProps.data.isActive ? t('users.deactivate') : t('users.activate')"
              />
              <pv-button 
                icon="pi pi-trash" 
                size="small"
                text 
                rounded 
                severity="secondary"
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

    <!-- User Form Dialog -->
    <pv-dialog 
      v-model:visible="dialogVisible" 
      modal 
      :header="editMode ? t('forms.user.editUser') : t('forms.user.newUser')" 
      :style="{ width: '500px' }"
      :closable="false"
    >
      <div class="flex flex-column gap-4">
        <div class="grid">
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-text 
                id="firstName" 
                v-model="form.firstName" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.firstName }"
              />
              <label for="firstName">{{ t('forms.user.firstName') }} *</label>
            </pv-float-label>
            <small v-if="formErrors.firstName" class="p-error">{{ formErrors.firstName }}</small>
          </div>
          <div class="col-12 md:col-6">
            <pv-float-label>
              <pv-input-text 
                id="lastName" 
                v-model="form.lastName" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.lastName }"
              />
              <label for="lastName">{{ t('forms.user.lastName') }} *</label>
            </pv-float-label>
            <small v-if="formErrors.lastName" class="p-error">{{ formErrors.lastName }}</small>
          </div>
        </div>

        <pv-float-label>
          <pv-input-text 
            id="dni" 
            v-model="form.dni" 
            class="w-full" 
            :class="{ 'p-invalid': formErrors.dni }"
          />
          <label for="dni">{{ t('forms.user.dni') }} *</label>
        </pv-float-label>
        <small v-if="formErrors.dni" class="p-error">{{ formErrors.dni }}</small>

        <pv-float-label>
          <pv-input-text 
            id="phoneNumber" 
            v-model="form.phoneNumber" 
            class="w-full" 
            :class="{ 'p-invalid': formErrors.phoneNumber }"
          />
          <label for="phoneNumber">{{ t('forms.user.phoneNumber') }} *</label>
        </pv-float-label>
        <small v-if="formErrors.phoneNumber" class="p-error">{{ formErrors.phoneNumber }}</small>

        <pv-float-label>
          <pv-input-text 
            id="role" 
            v-model="form.role" 
            class="w-full" 
            disabled
          />
          <label for="role">{{ t('forms.user.role') }} ({{ t('users.fixed') }})</label>
        </pv-float-label>
      </div>

      <template #footer>
        <div class="flex justify-content-end gap-2">
          <pv-button 
            :label="t('common.cancel')" 
            severity="secondary" 
            text 
            @click="dialogVisible = false" 
          />
          <pv-button 
            :label="editMode ? t('common.update') : t('common.create')" 
            icon="pi pi-save" 
            @click="save" 
          />
        </div>
      </template>
    </pv-dialog>

    <!-- Confirm Dialog -->
    <pv-confirm-dialog />
  </div>
</template>

<style scoped>


</style>
