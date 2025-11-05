import { defineStore } from 'pinia';
import { ref } from 'vue';
import { DashboardApi } from '../infrastructure/dashboard.api.js';
import { notificationService } from '../../shared/infrastructure/notification.service.js';

const api = new DashboardApi();

export const useDashboardStore = defineStore('dashboard', () => {
  const loading = ref(false);
  const metrics = ref(null);
  const errors = ref([]);

  async function fetchMetrics() {
    loading.value = true;
    errors.value = [];
    try {
      metrics.value = await api.getMetrics();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al cargar métricas';
      errors.value.push(message);
      notificationService.error(message);
    } finally {
      loading.value = false;
    }
  }

  return { loading, metrics, errors, fetchMetrics };
});









