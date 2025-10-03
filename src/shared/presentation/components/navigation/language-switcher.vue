<template>
  <div class="language-switcher">
    <button 
      :class="['lang-button', { active: currentLanguage === 'es' }]"
      @click="setLanguage('es')"
    >
      ES
    </button>
    <button 
      :class="['lang-button', { active: currentLanguage === 'en' }]"
      @click="setLanguage('en')"
    >
      EN
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const currentLanguage = ref('es')

onMounted(() => {
  // Cargar idioma guardado o usar español por defecto
  const savedLanguage = localStorage.getItem('movesys_language') || 'es'
  currentLanguage.value = savedLanguage
  locale.value = savedLanguage
})

const setLanguage = (lang) => {
  currentLanguage.value = lang
  locale.value = lang
  localStorage.setItem('movesys_language', lang)
  
  // Emitir evento para notificar cambio de idioma
  emit('language-changed', lang)
}

const emit = defineEmits(['language-changed'])
</script>

<style scoped>
.language-switcher {
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  height: 40px;
  width: 120px;
}

.lang-button {
  flex: 1;
  height: 32px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  color: #9ca3af;
  min-width: 40px;
}

.lang-button:hover {
  color: #6b7280;
  background: #f9fafb;
}

.lang-button.active {
  background: #6366f1;
  color: white;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.3);
}

.lang-button.active:hover {
  background: #4f46e5;
}

/* Responsive */
@media (max-width: 768px) {
  .language-switcher {
    width: 100px;
    height: 36px;
    padding: 3px;
  }
  
  .lang-button {
    height: 30px;
    font-size: 12px;
    min-width: 35px;
  }
}
</style>