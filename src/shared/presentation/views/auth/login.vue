<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)
const emailError = ref('')
const passwordError = ref('')

const isFormValid = computed(() => {
  return email.value.trim().length > 0 && password.value.trim().length > 0
})

const validateForm = () => {
  emailError.value = ''
  passwordError.value = ''

  let isValid = true

  if (!email.value) {
    emailError.value = 'El correo es requerido'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    emailError.value = 'Ingrese un correo válido'
    isValid = false
  }

  if (!password.value) {
    passwordError.value = 'La contraseña es requerida'
    isValid = false
  } else if (password.value.length < 6) {
    passwordError.value = 'La contraseña debe tener al menos 6 caracteres'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  console.log(' Iniciando proceso de login...')
  
  if (!validateForm()) {
    console.log(' Formulario no válido')
    return
  }

  console.log(' Formulario válido, iniciando login...')
  loading.value = true

  try {
    // Simular login
    console.log('⏳ Simulando login...')
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Guardar datos en localStorage
    const token = 'demo-token-' + Date.now()
    const userData = {
      email: email.value,
      firstName: 'Usuario',
      lastName: 'Demo',
      userType: 'Operador',
      rememberMe: rememberMe.value
    }
    
    localStorage.setItem('movesys_token', token)
    localStorage.setItem('movesys_user', JSON.stringify(userData))
    
    console.log('💾 Datos guardados en localStorage:', { token, userData })

    // Ir al dashboard
    console.log(' Redirigiendo al dashboard...')
    await router.push('/dashboard')
    console.log(' Redirección completada')
    
  } catch (error) {
    console.error(' Error en el login:', error)
    alert('Error en el login. Intente nuevamente.')
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="login-container">
    <div class="login-wrapper">
      <pv-card class="login-card">
        <template #header>
          <div class="login-header">
            <img src="../../../../../public/images/logo.png" height="184" width="679" class="logo-img"/>
            <h2 class="login-title">Sign up</h2>
          </div>
        </template>

        <template #content>
          <form @submit.prevent="handleLogin" class="login-form">
            <!-- Email Field -->
            <div class="input-group">
              <pv-float-label>
                <pv-input-text 
                  id="email"
                  v-model="email"
                  type="email"
                  :class="{ 'p-invalid': emailError }"
                />
                <label for="email">
                  <i class="pi pi-envelope"></i>
                  Correo Electrónico
                </label>
              </pv-float-label>
              <small v-if="emailError" class="p-error">
                <i class="pi pi-exclamation-triangle"></i>
                {{ emailError }}
              </small>
            </div>

            <!-- Password Field -->
            <div class="input-group">
              <pv-float-label>
                <pv-password 
                  id="password"
                  v-model="password"
                  :class="{ 'p-invalid': passwordError }"
                  :feedback="false"
                  toggle-mask
                />
                <label for="password">
                  <i class="pi pi-lock"></i>
                  Contraseña
                </label>
              </pv-float-label>
              <small v-if="passwordError" class="p-error">
                <i class="pi pi-exclamation-triangle"></i>
                {{ passwordError }}
              </small>
            </div>

            <!-- Remember Me -->
            <div class="remember-section">
              <pv-checkbox 
                v-model="rememberMe" 
                input-id="remember"
                binary
              />
              <label for="remember" class="remember-label">Recordarme</label>
            </div>

            <!-- Submit Button -->
            <pv-button 
              type="submit"
              label="Iniciar Sesión"
              icon="pi pi-sign-in"
              :loading="loading"
              :disabled="!isFormValid"
              class="login-button"
            />

            <!-- Register Link -->
            <div class="register-section">
              <p class="register-text">¿No tienes una cuenta?</p>
              <pv-button 
                type="button"
                label="Crear cuenta nueva"
                icon="pi pi-user-plus"
                text
                @click="goToRegister"
                class="register-button"
              />
            </div>
          </form>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(81, 25, 165, 0.07) 0%, rgba(255, 255, 255, 0.13) 100%);
  padding: 1rem;
}

.login-wrapper {
  width: 100%;
  max-width: 400px;
}

.logo-img{
   width: 180px;
  height: 55px;
}

:deep(.login-card) {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 0;
}

:deep(.login-card .p-card-header) {
  padding: 2rem 2rem 0 2rem;
  background: white;
  border-radius: 1rem 1rem 0 0;
}

:deep( .p-inputtext ){
  background-color: white !important;
}

:deep( .p-checkbox-input ){
  background-color: white !important;
}


:deep(.login-card .p-card-content) {
  padding: 2rem;
  background: white;
  border-radius: 0 0 1rem 1rem;
}

.login-header {
  text-align: center;
  margin-bottom: 0;
}

.logo-container {
  margin-bottom: 1rem;
}

.logo-icon {
  font-size: 3rem;
  color: #6366f1;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #6366f1;
  margin: 0;
}

.login-form {
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

.remember-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

:deep(.p-checkbox) {
  margin-right: 0.5rem;
}

:deep( .p-button .login-button){
  background-color: #7184c4;
}

:deep(.p-checkbox .p-checkbox-box) {
  width: 1rem;
  height: 1rem;
  border: 2px solid #d1d5db;
  border-radius: 0.25rem;
}

:deep(.p-checkbox .p-checkbox-box.p-highlight) {
  background: #6366f1;
  border-color: #6366f1;
}

.remember-label {
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
}

:deep(.login-button) {
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

:deep(.login-button:hover:not(:disabled)) {
  background: #4f46e5;
}

:deep(.login-button:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-section {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.register-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
}

:deep(.register-button) {
  color: #6366f1;
  font-weight: 600;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: color 0.3s ease;
  margin: 0 auto;
}

:deep(.register-button:hover) {
  color: #4f46e5;
  background: #f8fafc;
}

@media (max-width: 640px) {
  .login-container {
    padding: 0.5rem;
  }
  
  :deep(.login-card .p-card-header),
  :deep(.login-card .p-card-content) {
    padding: 1.5rem;
  }
}
</style>
