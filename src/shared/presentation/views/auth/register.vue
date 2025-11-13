<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { AuthApi } from '../../../infrastructure/auth-api.js'
import { notificationService } from '../../../infrastructure/notification.service.js'

const { t } = useI18n()
const router = useRouter()
const authApi = new AuthApi()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errors = ref({})

const isFormValid = computed(() => {
  return email.value.trim().length > 0 &&
         password.value.trim().length >= 6
})

const validateForm = () => {
  errors.value = {}

  if (!email.value.trim()) {
    errors.value.email = 'El correo es requerido'
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    errors.value.email = 'Ingrese un correo válido'
  }

  if (!password.value.trim()) {
    errors.value.password = 'La contraseña es requerida'
  } else if (password.value.trim().length < 6) {
    errors.value.password = 'La contraseña debe tener al menos 6 caracteres'
  }

  return Object.keys(errors.value).length === 0
}

const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  
  try {
    // Solo enviar Email y Password para crear un operario del sistema
    // Los conductores se crean por separado en el módulo de Conductores
    const registerData = {
      email: email.value.trim(),
      password: password.value.trim()
    }
    
    await authApi.signUp(registerData)
    
    notificationService.success('Operario registrado exitosamente')
    
    // Limpiar formulario
    email.value = ''
    password.value = ''
    
    // Redirigir al login después de un segundo
    setTimeout(() => {
      router.push('/login')
    }, 1500)
    
  } catch (error) {
    console.error('Registration error:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Error al registrar operario'
    notificationService.error(errorMessage)
    errors.value.general = errorMessage
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="register-container">
    <div class="register-wrapper">
      <pv-card class="register-card">
        <template #content>
          <div class="operator-info">
            <p class="info-text">
              <i class="pi pi-info-circle"></i>
              {{ t('auth.registerOperatorInfo') }}
            </p>
          </div>
          <form @submit.prevent="handleRegister" class="register-form">
            <!-- Email -->
            <div class="input-group">
              <pv-float-label>
                <pv-input-text 
                  id="email"
                  v-model="email"
                  type="email"
                  :class="{ 'p-invalid': errors.email }"
                />
                <label for="email">
                  <i class="pi pi-envelope"></i>
                  {{ t('auth.email') }}
                </label>
              </pv-float-label>
              <small v-if="errors.email" class="p-error">
                <i class="pi pi-exclamation-triangle"></i>
                {{ errors.email }}
              </small>
            </div>

            <!-- Password -->
            <div class="input-group">
              <pv-float-label>
                <pv-password 
                  id="password"
                  v-model="password"
                  :class="{ 'p-invalid': errors.password }"
                  :feedback="false"
                  toggle-mask
                />
                <label for="password">
                  <i class="pi pi-lock"></i>
                  {{ t('auth.password') }}
                </label>
              </pv-float-label>
              <small v-if="errors.password" class="p-error">
                <i class="pi pi-exclamation-triangle"></i>
                {{ errors.password }}
              </small>
            </div>

            <!-- Submit Button -->
            <pv-button 
              type="submit"
              :label="t('auth.register')"
              icon="pi pi-user-plus"
              :loading="loading"
              :disabled="!isFormValid"
              class="register-button"
            />

            <!-- Login Link -->
            <div class="login-section">
              <p class="login-text">{{ t('auth.alreadyHaveAccount') }}</p>
              <pv-button 
                :label="t('auth.login')"
                icon="pi pi-sign-in"
                class="login-button"
                text
                @click="goToLogin"
              />
            </div>
          </form>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(81, 25, 165, 0.07) 0%, rgba(255, 255, 255, 0.13) 100%);
  padding: 1rem;
}

.register-wrapper {
  width: 100%;
  max-width: 400px;
}

.logo-img {
  width: 180px;
  height: 55px;
}

:deep(.register-card) {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 0;
}

:deep(.register-card .p-card-header) {
  padding: 2rem 2rem 0 2rem;
  background: white;
  border-radius: 1rem 1rem 0 0;
}

:deep(.register-card .p-card-content) {
  padding: 2rem;
  background: white;
  border-radius: 0 0 1rem 1rem;
}

:deep(.p-inputtext) {
  background-color: white !important;
}

.register-header {
  text-align: center;
  margin-bottom: 0;
}

.register-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #6366f1;
  margin: 0;
}

.operator-info {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.info-text {
  color: #0369a1;
  font-size: 0.875rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-text i {
  color: #0ea5e9;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

:deep(.p-float-label label) {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

:deep(.p-float-label label i) {
  color: #6366f1;
}

:deep(.p-inputtext) {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: border-color 0.3s ease;
  color: #2b2f30;
}

:deep(.p-inputtext:focus) {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

:deep(.p-inputtext.p-invalid) {
  border-color: #ef4444;
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password .p-inputtext) {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: border-color 0.3s ease;
  color: #2b2f30;
}

:deep(.p-password .p-inputtext:focus) {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

:deep(.p-password.p-invalid .p-inputtext) {
  border-color: #ef4444;
}

.p-error {
  color: #ef4444;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

:deep(.register-button) {
  width: 100%;
  background: #6366f1;
  border: none;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

:deep(.register-button:hover:not(:disabled)) {
  background: #4f46e5;
}

:deep(.register-button:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-section {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.login-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

.login-button {
  color: #6366f1;
  font-weight: 600;
}

.login-button:hover {
  color: #4f46e5;
}

@media (max-width: 640px) {
  .register-container {
    padding: 0.5rem;
  }
  
  :deep(.register-card .p-card-header),
  :deep(.register-card .p-card-content) {
    padding: 1.5rem;
  }
}
</style>
