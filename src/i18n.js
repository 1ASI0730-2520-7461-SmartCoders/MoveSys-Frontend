import {createI18n} from "vue-i18n";
import en from "./locales/en.json";
import es from "./locales/es.json";

// Obtener idioma guardado o usar inglés por defecto
const savedLanguage = localStorage.getItem('movesys_language') || 'en';

const i18n = createI18n({
    legacy: false,
    locale: savedLanguage,
    fallbackLocale: 'en',
    messages: { en, es }
});

export default i18n;
