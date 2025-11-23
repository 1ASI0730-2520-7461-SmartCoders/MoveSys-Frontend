<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useConductoresStore } from '../../application/conductores.store.js'
import { ValidationService } from '../../../shared/infrastructure/validation.service.js'

const router = useRouter()
const route = useRoute()
const store = useConductoresStore()
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
      await store.updateConductor(form.value)
    } else {
      await store.addConductor(form.value)
    }
    router.push('/conductores')
  } catch (error) {
    console.error('Error saving conductor:', error)
  } finally {
    loading.value = false
  }
}

const cancel = () => {
  router.push('/conductores')
}

onMounted(() => {
  const conductorId = route.params.id
  if (conductorId) {
    editMode.value = true
    const conductor = store.conductores.find(c => c.id == conductorId)
    if (conductor) {
      form.value = {
        id: conductor.id,
        firstName: conductor.firstName,
        lastName: conductor.lastName,
        dni: conductor.dni,
        phoneNumber: conductor.phoneNumber,
        role: conductor.role,
        status: conductor.status
      }
    }
  }
})
</script>

<template>
  <div class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="text-2xl font-bold">
        {{ editMode ? 'Editar Conductor' : 'Nuevo Conductor' }}
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
              <label for="firstName" class="block mb-2 font-semibold">{{ t('forms.user.firstName') }} *</label>
              <pv-input-text 
                id="firstName" 
                v-model="form.firstName" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.firstName }" 
              />
              <small v-if="formErrors.firstName" class="p-error">{{ formErrors.firstName }}</small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="lastName" class="block mb-2 font-semibold">{{ t('forms.user.lastName') }} *</label>
              <pv-input-text 
                id="lastName" 
                v-model="form.lastName" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.lastName }" 
              />
              <small v-if="formErrors.lastName" class="p-error">{{ formErrors.lastName }}</small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="dni" class="block mb-2 font-semibold">{{ t('forms.user.dni') }} *</label>
              <pv-input-text 
                id="dni" 
                v-model="form.dni" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.dni }" 
              />
              <small v-if="formErrors.dni" class="p-error">{{ formErrors.dni }}</small>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="field mb-4">
              <label for="phoneNumber" class="block mb-2 font-semibold">{{ t('forms.user.phoneNumber') }} *</label>
              <pv-input-text 
                id="phoneNumber" 
                v-model="form.phoneNumber" 
                class="w-full" 
                :class="{ 'p-invalid': formErrors.phoneNumber }" 
              />
              <small v-if="formErrors.phoneNumber" class="p-error">{{ formErrors.phoneNumber }}</small>
            </div>
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
  color: #000000 !important;
}

:deep(.p-inputtext:focus) {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

:deep(.p-inputtext.p-invalid) {
  border-color: #dc3545;
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

