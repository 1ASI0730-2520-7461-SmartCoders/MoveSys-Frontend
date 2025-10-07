<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUsersStore } from '../../application/users.store.js'
import { ValidationService } from '../../../shared/infrastructure/validation.service.js'

const router = useRouter()
const route = useRoute()
const store = useUsersStore()
const { t } = useI18n()

const form = ref({
  firstName: '',
  lastName: '',
  dni: '',
  phoneNumber: '',
  role: 'driver',
  status: 'active'
})

const formErrors = ref({})
const editMode = ref(false)
const loading = ref(false)

const validationRules = {
  firstName: [ { required: true, message: t('forms.validation.firstNameRequired') } ],
  lastName: [ { required: true, message: t('forms.validation.lastNameRequired') } ],
  dni: [ { required: true, message: t('forms.validation.dniRequired') } ],
  phoneNumber: [ { required: true, message: t('forms.validation.phoneRequired') } ]
}

const roleOptions = [
  { label: t('forms.user.roleOptions.driver'), value: 'driver' },
  { label: t('forms.user.roleOptions.admin'), value: 'admin' },
  { label: t('forms.user.roleOptions.operator'), value: 'operator' }
]

const statusOptions = [
  { label: t('forms.user.statusOptions.active'), value: 'active' },
  { label: t('forms.user.statusOptions.inactive'), value: 'inactive' }
]

const validateForm = () => {
  const validation = ValidationService.validateForm(form.value, validationRules)
  formErrors.value = validation.errors
  return validation.isValid
}

const save = async () => {
  if (!validateForm()) return
  
  loading.value = true
  try {
    if (editMode.value) {
      await store.updateUser(form.value)
    } else {
      await store.addUser(form.value)
    }
    router.push('/users')
  } catch (error) {
    console.error('Error saving user:', error)
  } finally {
    loading.value = false
  }
}

const cancel = () => {
  router.push('/users')
}

onMounted(() => {
  const userId = route.params.id
  if (userId) {
    editMode.value = true
    // Load user data for editing
    const user = store.users.find(u => u.id == userId)
    if (user) {
      form.value = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        dni: user.dni,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status
      }
    }
  }
})
</script>

<template>
  <div class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="text-2xl font-bold">
        {{ editMode ? t('forms.user.editUser') : t('forms.user.newUser') }}
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

          <div class="col-12 md:col-6">
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
          </div>

          <div class="col-12 md:col-6">
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
          </div>

          <div class="col-12 md:col-6">
            <div class="p-3 bg-light border rounded">
              <strong>{{ t('forms.user.role') }}:</strong> {{ t('forms.user.roleOptions.driver') }}
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="p-3 bg-light border rounded">
              <strong>{{ t('forms.user.status') }}:</strong> {{ t('forms.user.statusOptions.active') }}
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
