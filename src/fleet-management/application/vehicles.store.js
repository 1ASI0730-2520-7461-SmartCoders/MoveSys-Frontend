import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { VehiclesApi } from '../infrastructure/vehicles.api.js';
import { Vehicle } from '../domain/vehicle.entity.js';
import { notificationService } from '../../shared/infrastructure/notification.service.js';

const api = new VehiclesApi();

export const useVehiclesStore = defineStore('vehicles', () => {
  const vehicles = ref([]);
  const loading = ref(false);
  const errors = ref([]);
  const searchQuery = ref('');
  const selectedType = ref('all');
  const selectedStatus = ref('all');

  const typeOptions = computed(() => [
    { label: 'Todos', value: 'all' },
    { label: 'Camión', value: 'truck' },
    { label: 'Furgoneta', value: 'van' },
    { label: 'Automóvil', value: 'car' },
    { label: 'Motocicleta', value: 'motorcycle' },
    { label: 'Remolque', value: 'trailer' }
  ]);

  const statusOptions = computed(() => [
    { label: 'Todos', value: 'all' },
    { label: 'Disponible', value: 'available' },
    { label: 'En uso', value: 'in_use' },
    { label: 'Mantenimiento', value: 'maintenance' },
    { label: 'Fuera de Servicio', value: 'out_of_service' }
  ]);

  const filteredVehicles = computed(() => {
    let list = vehicles.value;
    if (selectedType.value !== 'all') list = list.filter(v => v.type === selectedType.value);
    if (selectedStatus.value !== 'all') list = list.filter(v => v.status === selectedStatus.value);
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      list = list.filter(v =>
        (v.licensePlate || '').toLowerCase().includes(q) ||
        (v.brand || '').toLowerCase().includes(q) ||
        (v.model || '').toLowerCase().includes(q)
      );
    }
    return list;
  });

  async function fetchVehicles(params = {}) {
    loading.value = true;
    errors.value = [];
    try {
      vehicles.value = await api.list(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al cargar vehículos';
      errors.value.push(message);
      notificationService.error(message);
    } finally {
      loading.value = false;
    }
  }

  async function addVehicle(data) {
    loading.value = true;
    try {
      const vehicle = new Vehicle(data);
      const created = await api.create(vehicle);
      vehicles.value.push(created);
      notificationService.success('Vehículo creado');
      return created;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al crear vehículo';
      errors.value.push(message);
      notificationService.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateVehicle(data) {
    loading.value = true;
    try {
      const vehicle = new Vehicle(data);
      const updated = await api.update(vehicle);
      const idx = vehicles.value.findIndex(v => v.id === updated.id);
      if (idx !== -1) vehicles.value[idx] = updated;
      notificationService.success('Vehículo actualizado');
      return updated;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al actualizar vehículo';
      errors.value.push(message);
      notificationService.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function assignDriver(id, driverName) {
    loading.value = true;
    try {
      const updated = await api.assignDriver(id, driverName);
      console.log(' Vehículo actualizado después de asignar conductor:', updated);
      
      // Buscar y actualizar el vehículo en la lista
      const idx = vehicles.value.findIndex(v => v.id === updated.id);
      if (idx !== -1) {
        // Reemplazar completamente el vehículo con los datos actualizados del servidor
        vehicles.value[idx] = { ...vehicles.value[idx], ...updated };
        console.log(' Vehículo actualizado en la lista, índice:', idx);
      } else {
        // Si no se encuentra, recargar toda la lista
        console.log(' Vehículo no encontrado en lista, recargando...');
        await fetchVehicles();
      }
      notificationService.success('Conductor asignado correctamente');
      return updated;
    } catch (error) {
      console.error(' Error al asignar conductor:', error);
      const message = error.response?.data?.message || error.message || 'Error al asignar conductor';
      errors.value.push(message);
      notificationService.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateMileage(id, mileage) {
    loading.value = true;
    try {
      const updated = await api.updateMileage(id, mileage);
      const idx = vehicles.value.findIndex(v => v.id === updated.id);
      if (idx !== -1) vehicles.value[idx] = updated;
      notificationService.success('Kilometraje actualizado');
      return updated;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al actualizar kilometraje';
      errors.value.push(message);
      notificationService.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteVehicle(id) {
    loading.value = true;
    try {
      await api.remove(id);
      const idx = vehicles.value.findIndex(v => v.id === id);
      if (idx !== -1) vehicles.value.splice(idx, 1);
      notificationService.success('Vehículo eliminado');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al eliminar vehículo';
      errors.value.push(message);
      notificationService.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function setSearchQuery(q) { searchQuery.value = q }
  function setSelectedType(t) { selectedType.value = t }
  function setSelectedStatus(s) { selectedStatus.value = s }
  function clearFilters() { searchQuery.value = ''; selectedType.value = 'all'; selectedStatus.value = 'all' }

  return {
    vehicles,
    loading,
    errors,
    searchQuery,
    selectedType,
    selectedStatus,
    typeOptions,
    statusOptions,
    filteredVehicles,
    fetchVehicles,
    addVehicle,
    updateVehicle,
    assignDriver,
    updateMileage,
    deleteVehicle,
    setSearchQuery,
    setSelectedType,
    setSelectedStatus,
    clearFilters
  };
});


