import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { FuelApi } from '../infrastructure/fuel.api.js';
import { FuelEntry } from '../domain/fuel-entry.entity.js';
import { notificationService } from '../../shared/infrastructure/notification.service.js';

const api = new FuelApi();

export const useFuelStore = defineStore('fuel', () => {
  const entries = ref([]);
  const loading = ref(false);
  const errors = ref([]);
  const searchQuery = ref('');
  const selectedFuelType = ref('all');

  const fuelTypeOptions = computed(() => [
    { label: 'Todos', value: 'all' },
    { label: 'Diésel', value: 'diesel' },
    { label: 'Gasolina', value: 'gasoline' },
    { label: 'Eléctrico', value: 'electric' },
    { label: 'Híbrido', value: 'hybrid' },
  ]);

  const filteredEntries = computed(() => {
    let list = entries.value;
    if (selectedFuelType.value !== 'all') list = list.filter(e => e.fuelType === selectedFuelType.value)
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      list = list.filter(e =>
        e.vehiclePlate.toLowerCase().includes(q) ||
        e.station.toLowerCase().includes(q)
      )
    }
    return list;
  });

  async function fetchEntries(params = {}) {
    loading.value = true;
    errors.value = [];
    try {
      entries.value = await api.list(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al cargar consumos';
      errors.value.push(message);
      notificationService.error(message);
    } finally {
      loading.value = false;
    }
  }

  async function addEntry(data) {
    loading.value = true;
    try {
      const entry = new FuelEntry(data);
      const created = await api.create(entry);
      entries.value.push(created);
      notificationService.success('Carga de combustible registrada');
      return created;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al registrar consumo';
      errors.value.push(message);
      notificationService.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateEntry(data) {
    loading.value = true;
    try {
      const entry = new FuelEntry(data);
      const updated = await api.update(entry);
      const idx = entries.value.findIndex(e => e.id === updated.id);
      if (idx !== -1) entries.value[idx] = updated;
      notificationService.success('Registro actualizado');
      return updated;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al actualizar registro';
      errors.value.push(message);
      notificationService.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteEntry(id) {
    loading.value = true;
    try {
      await api.remove(id);
      const idx = entries.value.findIndex(e => e.id === id);
      if (idx !== -1) entries.value.splice(idx, 1);
      notificationService.success('Registro eliminado');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al eliminar registro';
      errors.value.push(message);
      notificationService.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function setSearchQuery(q) { searchQuery.value = q }
  function setSelectedFuelType(t) { selectedFuelType.value = t }
  function clearFilters() { searchQuery.value = ''; selectedFuelType.value = 'all' }

  return {
    entries,
    loading,
    errors,
    searchQuery,
    selectedFuelType,
    fuelTypeOptions,
    filteredEntries,
    fetchEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    setSearchQuery,
    setSelectedFuelType,
    clearFilters
  };
});








