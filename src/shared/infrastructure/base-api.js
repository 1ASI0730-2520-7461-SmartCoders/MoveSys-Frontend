import axios from 'axios';

const primaryApi = 'http://localhost:3000';
const fallbackApi = import.meta.env.VITE_MOVESYS_PLATFORM_API_FALLBACK_URL || '';
const fallbackApis = [fallbackApi, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:4000']
  .filter(Boolean)
  .filter((url, idx, arr) => arr.indexOf(url) === idx);

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

        // Intento de reconexión automático al fallback si el host principal falla
        const originalConfig = error.config || {};
        // Log útil para depurar 404/Network Error
        try {
          const attemptedUrl = `${this.#http.defaults.baseURL || ''}${originalConfig.url || ''}`;
          // eslint-disable-next-line no-console
          console.error('HTTP error:', {
            status: error.response?.status,
            attemptedUrl,
            baseURL: this.#http.defaults.baseURL,
            method: originalConfig.method,
          });
        } catch {}
        const isNetworkError = !error.response;
        const retryCount = originalConfig._retryCount || 0;

        // Retry for network errors using alternate base URLs
        if (isNetworkError && retryCount < fallbackApis.length) {
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

