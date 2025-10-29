import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { UsersApi } from '../infrastructure/users.api.js';
import { User } from '../domain/user.entity.js';
import { notificationService } from '../../shared/infrastructure/notification.service.js';

const api = new UsersApi();

export const useUsersStore = defineStore('users', () => {
  const users = ref([]);
  const currentUser = ref(null);
  const loading = ref(false);
  const errors = ref([]);
  const searchQuery = ref('');
  const selectedRole = ref('driver');
  const selectedStatus = ref('active');

  const totalUsers = computed(() => users.value.length);
  
  const activeUsers = computed(() => 
    users.value.filter(user => user.isActive)
  );

  const usersByRole = computed(() => users.value.filter(user => user.role === 'driver'));

  const filteredUsers = computed(() => {
    let filtered = users.value;

    filtered = filtered.filter(user => user.role === 'driver');

    filtered = filtered.filter(user => user.status === 'active');

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(query) ||
        (user.dni && user.dni.toLowerCase().includes(query)) ||
        (user.phoneNumber && user.phoneNumber.toLowerCase().includes(query))
      );
    }

    return filtered;
  });

  const roleOptions = computed(() => [
    { label: 'Conductor', value: 'driver' }
  ]);

  const statusOptions = computed(() => [
    { label: 'Activo', value: 'active' }
  ]);

  async function fetchUsers(params = {}) {
    loading.value = true;
    errors.value = [];
    try {
      users.value = await api.list(params);
      notificationService.success('Usuarios cargados correctamente');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al cargar usuarios';
      errors.value.push(errorMessage);
      notificationService.error(errorMessage);
    } finally {
      loading.value = false;
    }
  }

  async function fetchUserById(id) {
    loading.value = true;
    try {
      currentUser.value = await api.getById(id);
      return currentUser.value;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al cargar usuario';
      errors.value.push(errorMessage);
      notificationService.error(errorMessage);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function addUser(userData) {
    loading.value = true;
    try {
      const user = new User(userData);
      const created = await api.create(user);
      users.value.push(created);
      notificationService.success('Usuario creado correctamente');
      return created;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear usuario';
      errors.value.push(errorMessage);
      notificationService.error(errorMessage);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateUser(userData) {
    loading.value = true;
    try {
      const user = new User(userData);
      const updated = await api.update(user);
      const idx = users.value.findIndex(u => u.id === updated.id);
      if (idx !== -1) {
        users.value[idx] = updated;
      }
      notificationService.success('Usuario actualizado correctamente');
      return updated;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar usuario';
      errors.value.push(errorMessage);
      notificationService.error(errorMessage);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteUser(id) {
    loading.value = true;
    try {
      await api.remove(id);
      const idx = users.value.findIndex(u => u.id === id);
      if (idx !== -1) {
        users.value.splice(idx, 1);
      }
      notificationService.success('Usuario eliminado correctamente');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar usuario';
      errors.value.push(errorMessage);
      notificationService.error(errorMessage);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function searchUsers(query) {
    searchQuery.value = query;
    if (query) {
      loading.value = true;
      try {
        users.value = await api.search(query);
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Error en la búsqueda';
        errors.value.push(errorMessage);
        notificationService.error(errorMessage);
      } finally {
        loading.value = false;
      }
    } else {
      await fetchUsers();
    }
  }

  async function updateUserStatus(id, status) {
    loading.value = true;
    try {
      const updated = await api.updateStatus(id, status);
      const idx = users.value.findIndex(u => u.id === id);
      if (idx !== -1) {
        users.value[idx] = updated;
      }
      notificationService.success('Estado del usuario actualizado');
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
    users,
    currentUser,
    loading,
    errors,
    searchQuery,
    selectedRole,
    selectedStatus,
    
    totalUsers,
    activeUsers,
    usersByRole,
    filteredUsers,
    roleOptions,
    statusOptions,
    
    fetchUsers,
    fetchUserById,
    addUser,
    updateUser,
    deleteUser,
    searchUsers,
    updateUserStatus,
    setSearchQuery,
    setSelectedRole,
    setSelectedStatus,
    clearErrors,
    clearFilters
  };
});





