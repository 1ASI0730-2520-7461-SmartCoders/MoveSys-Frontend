import axios from 'axios';

// URL del backend: usar variable de entorno, Railway en producción, o localhost por defecto
const primaryApi = import.meta.env.VITE_API_URL 
  || (import.meta.env.PROD ? 'https://backend-movesys-production.up.railway.app' : 'http://localhost:5180');
// En desarrollo, no usar fallbacks automáticos para evitar errores de CORS
const fallbackApis = import.meta.env.PROD 
  ? [
      import.meta.env.VITE_MOVESYS_PLATFORM_API_FALLBACK_URL,
      'https://backend-movesys-production.up.railway.app'
    ].filter(Boolean)
  : [];

export class BaseApi {
  #http;
  constructor() {
    this.#http = axios.create({
      baseURL: primaryApi,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Request interceptor para agregar token de autenticación
    this.#http.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('movesys_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor para manejo de errores globales
    this.#http.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Redirección por no autorizado
        if (error.response?.status === 401) {
          localStorage.removeItem('movesys_token');
          localStorage.removeItem('movesys_user');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Log útil para depurar errores
        const originalConfig = error.config || {};
        try {
          const attemptedUrl = `${this.#http.defaults.baseURL || ''}${originalConfig.url || ''}`;
          // eslint-disable-next-line no-console
          console.error('HTTP error:', {
            status: error.response?.status,
            attemptedUrl,
            baseURL: this.#http.defaults.baseURL,
            method: originalConfig.method,
            message: error.message,
            corsError: !error.response && error.message?.includes('CORS')
          });
        } catch {}
        
        // Solo intentar fallback en producción y si hay fallbacks configurados
        const isNetworkError = !error.response;
        const retryCount = originalConfig._retryCount || 0;
        const shouldRetry = isNetworkError && retryCount < fallbackApis.length && import.meta.env.PROD;

        if (shouldRetry) {
          try {
            const nextBase = fallbackApis[retryCount];
            originalConfig._retryCount = retryCount + 1;
            this.#http.defaults.baseURL = nextBase;
            return await this.#http.request(originalConfig);
          } catch (retryError) {
            return Promise.reject(retryError);
          }
        }

        // If 404 and baseURL has /api or /api/vX suffix, strip it and retry once
        const status404 = error.response?.status === 404;
        const base = this.#http.defaults.baseURL || '';
        const hasApiSuffix = /\/api(\/v\d+)?$/.test(base);
        if (status404 && hasApiSuffix && !originalConfig._strippedApiPrefix) {
          try {
            originalConfig._strippedApiPrefix = true;
            const stripped = base.replace(/\/api(\/v\d+)?$/, '');
            this.#http.defaults.baseURL = stripped || '/';
            return await this.#http.request(originalConfig);
          } catch (retryError) {
            return Promise.reject(retryError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  get http() {
    return this.#http;
  }
}

