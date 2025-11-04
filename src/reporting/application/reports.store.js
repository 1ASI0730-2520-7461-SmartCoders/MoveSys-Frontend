import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ReportsApi } from '../infrastructure/reports.api.js';
import { notificationService } from '../../shared/infrastructure/notification.service.js';

const api = new ReportsApi();

export const useReportsStore = defineStore('reports', () => {
  const unifiedReport = ref([]);
  const deliverySummary = ref(null);
  const vehicleSummary = ref(null);
  const fuelSummary = ref(null);
  const maintenanceSummary = ref(null);
  const loading = ref(false);
  const errors = ref([]);

  async function fetchUnifiedReport() {
    loading.value = true;
    errors.value = [];
    try {
      unifiedReport.value = await api.getUnifiedOperationsReport();
      notificationService.success('Reporte cargado correctamente');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al cargar reporte';
      errors.value.push(errorMessage);
      notificationService.error(errorMessage);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchDeliverySummary() {
    loading.value = true;
    try {
      deliverySummary.value = await api.getDeliverySummary();
      return deliverySummary.value;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al cargar resumen de entregas';
      errors.value.push(errorMessage);
      notificationService.error(errorMessage);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchVehicleSummary() {
    loading.value = true;
    try {
      vehicleSummary.value = await api.getVehicleSummary();
      return vehicleSummary.value;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al cargar resumen de vehículos';
      errors.value.push(errorMessage);
      notificationService.error(errorMessage);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchFuelSummary() {
    loading.value = true;
    try {
      fuelSummary.value = await api.getFuelSummary();
      return fuelSummary.value;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al cargar resumen de combustible';
      errors.value.push(errorMessage);
      notificationService.error(errorMessage);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMaintenanceSummary() {
    loading.value = true;
    try {
      maintenanceSummary.value = await api.getMaintenanceSummary();
      return maintenanceSummary.value;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al cargar resumen de mantenimiento';
      errors.value.push(errorMessage);
      notificationService.error(errorMessage);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    unifiedReport,
    deliverySummary,
    vehicleSummary,
    fuelSummary,
    maintenanceSummary,
    loading,
    errors,
    fetchUnifiedReport,
    fetchDeliverySummary,
    fetchVehicleSummary,
    fetchFuelSummary,
    fetchMaintenanceSummary
  };
});

