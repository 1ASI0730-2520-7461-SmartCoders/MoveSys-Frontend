import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { MaintenanceApi } from '../infrastructure/maintenance.api.js';
import { Maintenance } from '../domain/maintenance.entity.js';
import { notificationService } from '../../shared/infrastructure/notification.service.js';

const api = new MaintenanceApi();

export const useMaintenanceStore = defineStore('maintenance', () => {
  const records = ref([]);
  const loading = ref(false);
  const errors = ref([]);
  const searchQuery = ref('');
  const selectedStatus = ref('all');
  const selectedType = ref('all');

  const statusOptions = computed(() => [
    { label: 'Todos', value: 'all' },
    { label: 'Programado', value: 'scheduled' },
    { label: 'En Progreso', value: 'in_progress' },
    { label: 'Completado', value: 'completed' },
    { label: 'Cancelado', value: 'cancelled' }
  ]);

  const typeOptions = computed(() => [
    { label: 'Todos', value: 'all' },
    { label: 'Preventivo', value: 'preventive' },
    { label: 'Correctivo', value: 'corrective' },
    { label: 'Emergencia', value: 'emergency' }
  ]);

  const filteredRecords = computed(() => {
    let list = records.value;
    
    if (selectedStatus.value !== 'all') {
      list = list.filter(r => r.status === selectedStatus.value);
    }
    
    if (selectedType.value !== 'all') {
      list = list.filter(r => r.maintenanceType === selectedType.value);
    }
    
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      list = list.filter(r =>
        (r.vehiclePlate || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.provider || '').toLowerCase().includes(q) ||
        (r.mechanic || '').toLowerCase().includes(q)
      );
    }
    
    return list;
  });

  async function fetchRecords(params = {}) {
    loading.value = true;
    errors.value = [];
    try {
      records.value = await api.list(params);
    } catch (error) {
      // Si el endpoint no existe (404), no mostrar error (el backend aún no está implementado)
      if (error.response?.status === 404) {
        console.warn('Maintenance endpoint no disponible aún:', error.response?.status);
        records.value = []; // Inicializar con lista vacía
        return;
      }
      const message = error.response?.data?.message || error.message || 'Error al cargar mantenimientos';
      errors.value.push(message);
      notificationService.error(message);
    } finally {
      loading.value = false;
    }
  }

  async function addRecord(data) {
    loading.value = true;
    try {
      const maintenance = new Maintenance(data);
      const created = await api.create(maintenance);
      records.value.push(created);
      notificationService.success('Mantenimiento registrado');
      return created;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al registrar mantenimiento';
      errors.value.push(message);
      notificationService.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateRecord(data) {
    loading.value = true;
    try {
      const maintenance = new Maintenance(data);
      const updated = await api.update(maintenance);
      const idx = records.value.findIndex(r => r.id === updated.id);
      if (idx !== -1) records.value[idx] = updated;
      notificationService.success('Mantenimiento actualizado');
      return updated;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al actualizar mantenimiento';
      errors.value.push(message);
      notificationService.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteRecord(id) {
    loading.value = true;
    try {
      const idx = records.value.findIndex(r => r.id === id);
      if (idx !== -1) {
        records.value.splice(idx, 1);
        notificationService.success('Mantenimiento eliminado');
        
        try {
          await api.remove(id);
        } catch (error) {
          console.warn('Could not delete from server:', error);
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al eliminar mantenimiento';
      errors.value.push(message);
      notificationService.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function setSearchQuery(q) { searchQuery.value = q }
  function setSelectedStatus(s) { selectedStatus.value = s }
  function setSelectedType(t) { selectedType.value = t }
  function clearFilters() { 
    searchQuery.value = ''; 
    selectedStatus.value = 'all';
    selectedType.value = 'all';
  }

  return {
    records,
    loading,
    errors,
    searchQuery,
    selectedStatus,
    selectedType,
    statusOptions,
    typeOptions,
    filteredRecords,
    fetchRecords,
    addRecord,
    updateRecord,
    deleteRecord,
    setSearchQuery,
    setSelectedStatus,
    setSelectedType,
    clearFilters
  };
});


