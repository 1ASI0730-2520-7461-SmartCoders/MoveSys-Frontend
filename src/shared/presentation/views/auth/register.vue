<template>
  <div class="register-container">
    <div class="register-wrapper">
      <Card class="register-card">
        <template #content>
          <!-- Logo and Title -->
          <div class="register-header">
            <div class="logo-container">
              <i class="pi pi-building logo-icon"></i>
            </div>
            <h2 class="register-title">Crear Cuenta</h2>
          </div>

          <!-- Registration Form -->
          <form @submit.prevent="handleRegister" class="register-form">
            <!-- User Type Selection -->
            <div class="input-group">
              <label class="input-label">
                <i class="pi pi-users"></i>
                Tipo de Usuario
              </label>
              <div class="user-type-selection">
                <div class="user-type-option" 
                     :class="{ active: userType === 'operador' }"
                     @click="selectUserType('operador')">
                  <i class="pi pi-desktop"></i>
                  <span>Operador</span>
                </div>
                <div class="user-type-option" 
                     :class="{ active: userType === 'chofer' }"
                     @click="selectUserType('chofer')">
                  <i class="pi pi-car"></i>
                  <span>Chofer</span>
                </div>
              </div>
            </div>

            <!-- First Name -->
            <div class="input-group">
              <label for="firstName" class="input-label">
                <i class="pi pi-user"></i>
                Nombre
              </label>
              <InputText 
                id="firstName"
                v-model="firstName"
                placeholder="Tu nombre"
                class="custom-input"
              />
            </div>

            <!-- Last Name -->
            <div class="input-group">
              <label for="lastName" class="input-label">
                <i class="pi pi-user"></i>
                Apellido
              </label>
              <InputText 
                id="lastName"
                v-model="lastName"
                placeholder="Tu apellido"
                class="custom-input"
              />
            </div>

            <!-- Email -->
            <div class="input-group">
              <label for="email" class="input-label">
                <i class="pi pi-envelope"></i>
                Correo Electrónico
              </label>
              <InputText 
                id="email"
                v-model="email"
                type="email"
                placeholder="tu@email.com"
                class="custom-input"
              />
            </div>

            <!-- Password -->
            <div class="input-group">
              <label for="password" class="input-label">
                <i class="pi pi-lock"></i>
                Contraseña
              </label>
              <Password 
                id="password"
                v-model="password"
                placeholder="Tu contraseña"
                :feedback="false"
                toggleMask
                class="custom-password"
              />
            </div>

            <!-- Terms and Conditions -->
            <div class="terms-section">
              <Checkbox 
                v-model="acceptTerms" 
                inputId="terms" 
                :binary="true"
              />
              <label for="terms" class="terms-label">
                Acepto los <a href="#" @click.prevent="showTerms" class="terms-link">términos y condiciones</a>
              </label>
            </div>

            <!-- Submit Button -->
            <Button 
              type="submit"
              label="Crear Cuenta"
              icon="pi pi-user-plus"
              class="register-button"
              :loading="loading"
              :disabled="!isFormValid"
            />

            <!-- Login Link -->
            <div class="login-section">
              <p class="login-text">¿Ya tienes una cuenta?</p>
              <Button 
                label="Iniciar sesión"
                icon="pi pi-sign-in"
                class="login-button"
                text
                @click="goToLogin"
              />
            </div>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userType = ref('')
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const acceptTerms = ref(false)
const loading = ref(false)

const isFormValid = computed(() => {
  return userType.value &&
         firstName.value.trim().length > 0 &&
         lastName.value.trim().length > 0 &&
         email.value.trim().length > 0 &&
         password.value.trim().length > 0 &&
         acceptTerms.value
})

const selectUserType = (type) => {
  userType.value = type
}

const handleRegister = async () => {
  if (!isFormValid.value) return
  
  loading.value = true
  
  try {
    // Simular registro
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Guardar usuario en localStorage
    const newUser = {
      id: Date.now(),
      userType: userType.value,
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      status: 'Activo',
      registrationDate: new Date()
    }
    
    const users = JSON.parse(localStorage.getItem('movesys_users') || '[]')
    users.push(newUser)
    localStorage.setItem('movesys_users', JSON.stringify(users))
    
    alert(`¡Cuenta de ${userType.value} creada exitosamente!\nUsuario: ${newUser.firstName} ${newUser.lastName}`)
    
    // Reset form
    userType.value = ''
    firstName.value = ''
    lastName.value = ''
    email.value = ''
    password.value = ''
    acceptTerms.value = false
    
    // Ir al login
    setTimeout(() => {
      router.push('/login')
    }, 1000)
    
  } catch (error) {
    console.error('Registration error:', error)
    alert('Error al crear la cuenta. Intente nuevamente.')
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

const showTerms = () => {
  alert('Aquí se mostrarían los términos y condiciones')
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.register-wrapper {
  width: 100%;
  max-width: 500px;
}

.register-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-container {
  margin-bottom: 1rem;
}

.logo-icon {
  font-size: 3rem;
  color: #6366f1;
}

.register-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
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

.input-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-label i {
  color: #6366f1;
}

.custom-input {
  width: 100%;
}

.custom-password {
  width: 100%;
}

.user-type-selection {
  display: flex;
  gap: 1rem;
}

.user-type-option {
  flex: 1;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-type-option:hover {
  border-color: #6366f1;
  background: #f8fafc;
}

.user-type-option.active {
  border-color: #6366f1;
  background: #eff6ff;
}

.user-type-option i {
  display: block;
  font-size: 1.5rem;
  color: #6366f1;
  margin-bottom: 0.5rem;
}

.user-type-option span {
  font-weight: 600;
  color: #374151;
}

.terms-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.terms-label {
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
}

.terms-link {
  color: #6366f1;
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.register-button {
  width: 100%;
  background: #10b981;
  border: none;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  color: white;
}

.register-button:hover:not(:disabled) {
  background: #059669;
}

.register-button:disabled {
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

/* PrimeVue Overrides */
:deep(.p-card-content) {
  padding: 2rem;
}

:deep(.p-inputtext) {
  border-radius: 0.5rem;
  border: 2px solid #e5e7eb;
  padding: 0.75rem;
  font-size: 0.875rem;
}

:deep(.p-inputtext:focus) {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

:deep(.p-password input) {
  border-radius: 0.5rem;
  border: 2px solid #e5e7eb;
  padding: 0.75rem;
}

:deep(.p-password:not(.p-disabled).p-focus input) {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

:deep(.p-checkbox .p-checkbox-box) {
  border-radius: 0.25rem;
  border: 2px solid #d1d5db;
}

:deep(.p-checkbox:not(.p-disabled):hover .p-checkbox-box) {
  border-color: #6366f1;
}

:deep(.p-checkbox.p-highlight .p-checkbox-box) {
  background: #6366f1;
  border-color: #6366f1;
}

@media (max-width: 640px) {
  .register-container {
    padding: 0.5rem;
  }
  
  .register-wrapper {
    max-width: 100%;
  }
  
  .user-type-selection {
    flex-direction: column;
  }
  
  :deep(.p-card-content) {
    padding: 1.5rem;
  }
}
</style>