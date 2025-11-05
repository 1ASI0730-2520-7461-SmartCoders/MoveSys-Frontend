import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { DeliveriesApi } from '../infrastructure/deliveries.api.js';
import { Delivery } from '../domain/delivery.entity.js';
import { notificationService } from '../../shared/infrastructure/notification.service.js';

const api = new DeliveriesApi();

export const useDeliveriesStore = defineStore('deliveries', () => {
  const deliveries = ref([]);
  const loading = ref(false);
  const errors = ref([]);
  const searchQuery = ref('');
  const selectedStatus = ref('all');

  const filteredDeliveries = computed(() => {
    let list = deliveries.value;
    if (selectedStatus.value !== 'all') {
      list = list.filter(d => d.status === selectedStatus.value);
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      list = list.filter(d =>
        d.code.toLowerCase().includes(q) ||
        d.customerName.toLowerCase().includes(q) ||
        d.address.toLowerCase().includes(q)
      );
    }
    return list;
  });

  const statusOptions = computed(() => [
    { label: 'Todos', value: 'all' },
    { label: 'Pendiente', value: 'pending' },
    { label: 'En Ruta', value: 'in_transit' },
    { label: 'Completado', value: 'completed' },
    { label: 'Cancelado', value: 'cancelled' }
  ]);

  async function fetchDeliveries(params = {}) {
    loading.value = true;
    errors.value = [];
    try {
      deliveries.value = await api.list(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al cargar entregas';
      errors.value.push(message);
      notificationService.error(message);
    } finally {
      loading.value = false;
    }
  }

  async function addDelivery(data) {
    loading.value = true;
    try {
      const delivery = new Delivery(data);
      const created = await api.create(delivery);
      deliveries.value.push(created);
      notificationService.success('Entrega creada correctamente');
      return created;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al crear entrega';
      errors.value.push(message);
      notificationService.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateDelivery(data) {
    loading.value = true;
    try {
      const delivery = new Delivery(data);
      const updated = await api.update(delivery);
      const idx = deliveries.value.findIndex(d => d.id === updated.id);
      if (idx !== -1) deliveries.value[idx] = updated;
      notificationService.success('Entrega actualizada');
      return updated;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al actualizar entrega';
      errors.value.push(message);
      notificationService.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteDelivery(id) {
    loading.value = true;
    try {
      await api.remove(id);
      const idx = deliveries.value.findIndex(d => d.id === id);
      if (idx !== -1) deliveries.value.splice(idx, 1);
      notificationService.success('Entrega eliminada');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al eliminar entrega';
      errors.value.push(message);
      notificationService.error(message);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function setSearchQuery(q) {
    searchQuery.value = q;
  }

  function setSelectedStatus(status) {
    selectedStatus.value = status;
  }

  function clearFilters() {
    searchQuery.value = '';
    selectedStatus.value = 'all';
  }

  return {
    deliveries,
    loading,
    errors,
    searchQuery,
    selectedStatus,
    filteredDeliveries,
    statusOptions,
    fetchDeliveries,
    addDelivery,
    updateDelivery,
    deleteDelivery,
    setSearchQuery,
    setSelectedStatus,
    clearFilters
  };
});









