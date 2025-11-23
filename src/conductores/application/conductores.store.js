import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ConductoresApi } from '../infrastructure/conductores.api.js';
import { Conductor } from '../domain/conductor.entity.js';
import { notificationService } from '../../shared/infrastructure/notification.service.js';

const api = new ConductoresApi();

export const useConductoresStore = defineStore('conductores', () => {
  const conductores = ref([]);
  const currentConductor = ref(null);
  const loading = ref(false);
  const errors = ref([]);
  const searchQuery = ref('');
  const selectedRole = ref('all');
  const selectedStatus = ref('all');

  const totalConductores = computed(() => conductores.value.length);
  
  const activeConductores = computed(() => 
    conductores.value.filter(conductor => conductor.isActive)
  );

  const conductoresByRole = computed(() => conductores.value);

  const filteredConductores = computed(() => {
    let filtered = conductores.value;

    // Filtrar por rol solo si hay un filtro seleccionado
    if (selectedRole.value && selectedRole.value !== 'all') {
      filtered = filtered.filter(conductor => conductor.role === selectedRole.value);
    }

    // Filtrar por estado solo si hay un filtro seleccionado
    if (selectedStatus.value && selectedStatus.value !== 'all') {
      filtered = filtered.filter(conductor => conductor.status === selectedStatus.value);
    }

    // Búsqueda por texto
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(conductor => 
        conductor.fullName.toLowerCase().includes(query) ||
        (conductor.dni && conductor.dni.toLowerCase().includes(query)) ||
        (conductor.phoneNumber && conductor.phoneNumber.toLowerCase().includes(query))
      );
    }

    return filtered;
  });

  const roleOptions = computed(() => [
    { label: 'Todos', value: 'all' },
    { label: 'Conductor', value: 'driver' },
    { label: 'Operador', value: 'operator' },
    { label: 'Administrador', value: 'admin' }
  ]);

  const statusOptions = computed(() => [
    { label: 'Todos', value: 'all' },
    { label: 'Activo', value: 'active' },
    { label: 'Inactivo', value: 'inactive' },
    { label: 'Suspendido', value: 'suspended' }
  ]);

  async function fetchConductores(params = {}) {
    loading.value = true;
    errors.value = [];
    try {
      conductores.value = await api.list(params);
      notificationService.success('Conductores cargados correctamente');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al cargar conductores';
      errors.value.push(errorMessage);
      notificationService.error(errorMessage);
    } finally {
      loading.value = false;
    }
  }

  async function fetchConductorById(id) {
    loading.value = true;
    try {
      currentConductor.value = await api.getById(id);
      return currentConductor.value;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al cargar conductor';
      errors.value.push(errorMessage);
      notificationService.error(errorMessage);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function addConductor(conductorData) {
    loading.value = true;
    try {
      const conductor = new Conductor(conductorData);
      const created = await api.create(conductor);
      conductores.value.push(created);
      notificationService.success('Conductor creado correctamente');
      return created;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear conductor';
      errors.value.push(errorMessage);
      notificationService.error(errorMessage);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateConductor(conductorData) {
    loading.value = true;
    try {
      const conductor = new Conductor(conductorData);
      const updated = await api.update(conductor);
      const idx = conductores.value.findIndex(c => c.id === updated.id);
      if (idx !== -1) {
        conductores.value[idx] = updated;
      }
      notificationService.success('Conductor actualizado correctamente');
      return updated;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar conductor';
      errors.value.push(errorMessage);
      notificationService.error(errorMessage);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteConductor(id) {
    loading.value = true;
    try {
      await api.remove(id);
      const idx = conductores.value.findIndex(c => c.id === id);
      if (idx !== -1) {
        conductores.value.splice(idx, 1);
      }
      notificationService.success('Conductor eliminado correctamente');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar conductor';
      errors.value.push(errorMessage);
      notificationService.error(errorMessage);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function searchConductores(query) {
    searchQuery.value = query;
    if (query) {
      loading.value = true;
      try {
        conductores.value = await api.search(query);
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Error en la búsqueda';
        errors.value.push(errorMessage);
        notificationService.error(errorMessage);
      } finally {
        loading.value = false;
      }
    } else {
      await fetchConductores();
    }
  }

  async function updateConductorStatus(id, status) {
    loading.value = true;
    try {
      const updated = await api.updateStatus(id, status);
      const idx = conductores.value.findIndex(c => c.id === id);
      if (idx !== -1) {
        conductores.value[idx] = updated;
      }
      notificationService.success('Estado del conductor actualizado');
      return updated;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar estado';
      errors.value.push(errorMessage);
      notificationService.error(errorMessage);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function setSearchQuery(query) {
    searchQuery.value = query;
  }

  function setSelectedRole(role) {
    selectedRole.value = role;
  }

  function setSelectedStatus(status) {
    selectedStatus.value = status;
  }

  function clearErrors() {
    errors.value = [];
  }

  function clearFilters() {
    searchQuery.value = '';
    selectedRole.value = 'all';
    selectedStatus.value = 'all';
  }

  return {
    conductores,
    currentConductor,
    loading,
    errors,
    searchQuery,
    selectedRole,
    selectedStatus,
    
    totalConductores,
    activeConductores,
    conductoresByRole,
    filteredConductores,
    roleOptions,
    statusOptions,
    
    fetchConductores,
    fetchConductorById,
    addConductor,
    updateConductor,
    deleteConductor,
    searchConductores,
    updateConductorStatus,
    setSearchQuery,
    setSelectedRole,
    setSelectedStatus,
    clearErrors,
    clearFilters
  };
});


