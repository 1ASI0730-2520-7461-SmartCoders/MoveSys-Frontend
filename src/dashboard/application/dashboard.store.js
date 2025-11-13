import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useDeliveriesStore } from '../../delivery-management/application/deliveries.store.js';
import { useVehiclesStore } from '../../fleet-management/application/vehicles.store.js';
import { useConductoresStore } from '../../conductores/application/conductores.store.js';
import { useFuelStore } from '../../fuel-consumption/application/fuel.store.js';
import { useMaintenanceStore } from '../../maintenance-management/application/maintenance.store.js';

export const useDashboardStore = defineStore('dashboard', () => {
  const loading = ref(false);
  const errors = ref([]);

  // Estadísticas generales
  const stats = computed(() => {
    const deliveriesStore = useDeliveriesStore();
    const vehiclesStore = useVehiclesStore();
    const conductoresStore = useConductoresStore();
    const fuelStore = useFuelStore();
    const maintenanceStore = useMaintenanceStore();
    
    return {
      totalDeliveries: deliveriesStore.deliveries?.length || 0,
      totalVehicles: vehiclesStore.vehicles?.length || 0,
      totalConductores: conductoresStore.conductores?.length || 0,
      totalFuelEntries: fuelStore.entries?.length || 0,
      totalMaintenance: maintenanceStore.records?.length || 0,
      pendingDeliveries: deliveriesStore.deliveries?.filter(d => d.status === 'pending').length || 0,
      activeVehicles: vehiclesStore.vehicles?.filter(v => v.status === 'available' || v.status === 'in_use').length || 0,
      activeConductores: conductoresStore.conductores?.filter(c => c.status === 'active').length || 0
    };
  });

  // Datos para gráfico de entregas por estado
  const deliveriesByStatus = computed(() => {
    const deliveriesStore = useDeliveriesStore();
    const deliveries = deliveriesStore.deliveries || [];
    const statusCounts = {
      pending: deliveries.filter(d => d.status === 'pending' || d.status === 'Pendiente').length,
      in_progress: deliveries.filter(d => d.status === 'in_progress' || d.status === 'in_transit' || d.status === 'En Proceso').length,
      completed: deliveries.filter(d => d.status === 'completed' || d.status === 'Completada').length,
      cancelled: deliveries.filter(d => d.status === 'cancelled' || d.status === 'Cancelada').length
    };
    return {
      labels: ['Pendientes', 'En Proceso', 'Completadas', 'Canceladas'],
      datasets: [{
        data: [statusCounts.pending, statusCounts.in_progress, statusCounts.completed, statusCounts.cancelled],
        backgroundColor: ['#FFA726', '#42A5F5', '#66BB6A', '#EF5350']
      }]
    };
  });

  // Datos para gráfico de vehículos por estado
  const vehiclesByStatus = computed(() => {
    const vehiclesStore = useVehiclesStore();
    const maintenanceStore = useMaintenanceStore();
    const vehicles = vehiclesStore.vehicles || [];
    const maintenanceRecords = maintenanceStore.records || [];
    
    // Aplicar la misma lógica que en fleet-management.vue
    const vehiclesWithStatus = vehicles.map(vehicle => {
      // Verificar si hay un mantenimiento en progreso para este vehículo
      const maintenanceInProgress = maintenanceRecords.find(m => 
        m.vehiclePlate === vehicle.licensePlate && 
        m.status === 'in_progress'
      );
      
      if (maintenanceInProgress) {
        return { ...vehicle, computedStatus: 'maintenance' };
      }
      
      // Si tiene conductor asignado, está en uso
      if (vehicle.currentDriver && 
          vehicle.currentDriver !== 'Unassigned' && 
          vehicle.currentDriver !== 'null' && 
          vehicle.currentDriver !== null) {
        return { ...vehicle, computedStatus: 'in_use' };
      }
      
      // Usar el status del vehículo directamente
      return { ...vehicle, computedStatus: vehicle.status || 'available' };
    });
    
    const statusCounts = {
      available: vehiclesWithStatus.filter(v => v.computedStatus === 'available').length,
      in_use: vehiclesWithStatus.filter(v => v.computedStatus === 'in_use').length,
      maintenance: vehiclesWithStatus.filter(v => v.computedStatus === 'maintenance').length,
      out_of_service: vehiclesWithStatus.filter(v => v.computedStatus === 'out_of_service').length
    };
    
    return {
      labels: ['Disponibles', 'En Uso', 'Mantenimiento', 'Fuera de Servicio'],
      datasets: [{
        label: 'Vehículos',
        backgroundColor: ['#66BB6A', '#42A5F5', '#FFA726', '#EF5350'],
        data: [statusCounts.available, statusCounts.in_use, statusCounts.maintenance, statusCounts.out_of_service]
      }]
    };
  });

  // Datos para gráfico de consumo de combustible
  const fuelConsumptionData = computed(() => {
    const fuelStore = useFuelStore();
    const entries = fuelStore.entries || [];
    if (entries.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }
    
    // Agrupar por mes (últimos 6 meses)
    const monthlyData = {};
    entries.forEach(entry => {
      if (!entry.filledAt) return;
      const date = new Date(entry.filledAt);
      if (isNaN(date.getTime())) return; // Validar fecha
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (entry.liters || 0);
    });

    const sortedMonths = Object.keys(monthlyData).sort().slice(-6);
    return {
      labels: sortedMonths.map(m => {
        const [year, month] = m.split('-');
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      }),
      datasets: [{
        label: 'Litros de Combustible',
        data: sortedMonths.map(m => monthlyData[m]),
        fill: false,
        borderColor: '#42A5F5',
        backgroundColor: 'rgba(66, 165, 245, 0.2)',
        tension: 0.4
      }]
    };
  });

  // Datos para gráfico de mantenimientos por tipo
  const maintenanceByType = computed(() => {
    const maintenanceStore = useMaintenanceStore();
    const records = maintenanceStore.records || [];
    const typeCounts = {
      preventive: records.filter(m => m.maintenanceType === 'preventive' || m.maintenanceType === 'Preventivo').length,
      corrective: records.filter(m => m.maintenanceType === 'corrective' || m.maintenanceType === 'Correctivo').length,
      emergency: records.filter(m => m.maintenanceType === 'emergency' || m.maintenanceType === 'Emergencia').length
    };
    return {
      labels: ['Preventivo', 'Correctivo', 'Emergencia'],
      datasets: [{
        data: [typeCounts.preventive, typeCounts.corrective, typeCounts.emergency],
        backgroundColor: ['#66BB6A', '#FFA726', '#EF5350']
      }]
    };
  });

  async function fetchAllData() {
    loading.value = true;
    errors.value = [];
    try {
      const deliveriesStore = useDeliveriesStore();
      const vehiclesStore = useVehiclesStore();
      const conductoresStore = useConductoresStore();
      const fuelStore = useFuelStore();
      const maintenanceStore = useMaintenanceStore();
      
      await Promise.all([
        deliveriesStore.fetchDeliveries(),
        vehiclesStore.fetchVehicles(),
        conductoresStore.fetchConductores(),
        fuelStore.fetchEntries(),
        maintenanceStore.fetchRecords()
      ]);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al cargar datos del dashboard';
      errors.value.push(message);
    } finally {
      loading.value = false;
    }
  }

  // Gráfico de costos de combustible por vehículo
  const fuelCostByVehicle = computed(() => {
    const fuelStore = useFuelStore();
    const entries = fuelStore.entries || [];
    if (entries.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }
    
    const vehicleCosts = {};
    entries.forEach(entry => {
      const plate = entry.vehiclePlate || 'Sin placa';
      vehicleCosts[plate] = (vehicleCosts[plate] || 0) + (entry.totalPaid || entry.liters * entry.costPerLiter || 0);
    });
    
    const sorted = Object.entries(vehicleCosts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Top 5
    
    return {
      labels: sorted.map(([plate]) => plate),
      datasets: [{
        label: 'Costo Total (S/.)',
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC'],
        data: sorted.map(([, cost]) => parseFloat(cost.toFixed(2)))
      }]
    };
  });

  // Gráfico de entregas por mes
  const deliveriesByMonth = computed(() => {
    const deliveriesStore = useDeliveriesStore();
    const deliveries = deliveriesStore.deliveries || [];
    if (deliveries.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }
    
    const monthlyData = {};
    deliveries.forEach(delivery => {
      if (!delivery.scheduledAt) return;
      const date = new Date(delivery.scheduledAt);
      if (isNaN(date.getTime())) return;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });
    
    const sortedMonths = Object.keys(monthlyData).sort().slice(-6);
    return {
      labels: sortedMonths.map(m => {
        const [year, month] = m.split('-');
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      }),
      datasets: [{
        label: 'Entregas',
        data: sortedMonths.map(m => monthlyData[m]),
        backgroundColor: 'rgba(66, 165, 245, 0.6)',
        borderColor: '#42A5F5',
        borderWidth: 2
      }]
    };
  });

  // Gráfico de conductores más activos
  const topConductores = computed(() => {
    const deliveriesStore = useDeliveriesStore();
    const deliveries = deliveriesStore.deliveries || [];
    
    const conductorCounts = {};
    deliveries.forEach(delivery => {
      if (delivery.driverName) {
        conductorCounts[delivery.driverName] = (conductorCounts[delivery.driverName] || 0) + 1;
      }
    });
    
    const sorted = Object.entries(conductorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return {
      labels: sorted.map(([name]) => name),
      datasets: [{
        label: 'Entregas',
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC'],
        data: sorted.map(([, count]) => count)
      }]
    };
  });

  // Gráfico de consumo de combustible por vehículo
  const fuelConsumptionByVehicle = computed(() => {
    const fuelStore = useFuelStore();
    const entries = fuelStore.entries || [];
    if (entries.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }
    
    const vehicleLiters = {};
    entries.forEach(entry => {
      const plate = entry.vehiclePlate || 'Sin placa';
      vehicleLiters[plate] = (vehicleLiters[plate] || 0) + (entry.liters || 0);
    });
    
    const sorted = Object.entries(vehicleLiters)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return {
      labels: sorted.map(([plate]) => plate),
      datasets: [{
        label: 'Litros',
        backgroundColor: 'rgba(66, 165, 245, 0.6)',
        borderColor: '#42A5F5',
        borderWidth: 2,
        data: sorted.map(([, liters]) => parseFloat(liters.toFixed(2)))
      }]
    };
  });

  // Gráfico de distancias totales por entrega
  const distanceDistribution = computed(() => {
    const deliveriesStore = useDeliveriesStore();
    const deliveries = deliveriesStore.deliveries || [];
    
    const ranges = {
      '0-20 km': 0,
      '21-40 km': 0,
      '41-60 km': 0,
      '61+ km': 0
    };
    
    deliveries.forEach(delivery => {
      const distance = delivery.distanceKm || 0;
      if (distance <= 20) ranges['0-20 km']++;
      else if (distance <= 40) ranges['21-40 km']++;
      else if (distance <= 60) ranges['41-60 km']++;
      else ranges['61+ km']++;
    });
    
    return {
      labels: Object.keys(ranges),
      datasets: [{
        data: Object.values(ranges),
        backgroundColor: ['#66BB6A', '#42A5F5', '#FFA726', '#EF5350']
      }]
    };
  });

  // Gráfico de costos de combustible por mes
  const fuelCostByMonth = computed(() => {
    const fuelStore = useFuelStore();
    const entries = fuelStore.entries || [];
    if (entries.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }
    
    const monthlyCosts = {};
    entries.forEach(entry => {
      if (!entry.filledAt) return;
      const date = new Date(entry.filledAt);
      if (isNaN(date.getTime())) return;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const cost = entry.totalPaid || entry.liters * entry.costPerLiter || 0;
      monthlyCosts[monthKey] = (monthlyCosts[monthKey] || 0) + cost;
    });
    
    const sortedMonths = Object.keys(monthlyCosts).sort().slice(-6);
    return {
      labels: sortedMonths.map(m => {
        const [year, month] = m.split('-');
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      }),
      datasets: [{
        label: 'Costo Total (S/.)',
        data: sortedMonths.map(m => parseFloat(monthlyCosts[m].toFixed(2))),
        fill: true,
        borderColor: '#EF5350',
        backgroundColor: 'rgba(239, 83, 80, 0.2)',
        tension: 0.4
      }]
    };
  });

  // Gráfico de entregas por provincia de destino
  const deliveriesByProvince = computed(() => {
    const deliveriesStore = useDeliveriesStore();
    const deliveries = deliveriesStore.deliveries || [];
    
    const provinceCounts = {};
    deliveries.forEach(delivery => {
      const province = delivery.destinationProvince || 'Sin provincia';
      provinceCounts[province] = (provinceCounts[province] || 0) + 1;
    });
    
    const sorted = Object.entries(provinceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return {
      labels: sorted.map(([province]) => province),
      datasets: [{
        data: sorted.map(([, count]) => count),
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC']
      }]
    };
  });

  // Gráfico de tipos de vehículos (Pie Chart)
  const vehiclesByType = computed(() => {
    const vehiclesStore = useVehiclesStore();
    const vehicles = vehiclesStore.vehicles || [];
    
    const typeCounts = {
      truck: vehicles.filter(v => v.type === 'truck').length,
      van: vehicles.filter(v => v.type === 'van').length,
      car: vehicles.filter(v => v.type === 'car').length,
      motorcycle: vehicles.filter(v => v.type === 'motorcycle').length,
      trailer: vehicles.filter(v => v.type === 'trailer').length
    };
    
    const labels = [];
    const data = [];
    const colors = ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC'];
    const typeNames = {
      truck: 'Camión',
      van: 'Furgoneta',
      car: 'Automóvil',
      motorcycle: 'Motocicleta',
      trailer: 'Remolque'
    };
    
    Object.entries(typeCounts).forEach(([type, count], index) => {
      if (count > 0) {
        labels.push(typeNames[type] || type);
        data.push(count);
      }
    });
    
    return {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length)
      }]
    };
  });

  // Gráfico de tipos de combustible (Doughnut Chart)
  const fuelByType = computed(() => {
    const fuelStore = useFuelStore();
    const entries = fuelStore.entries || [];
    
    const fuelTypeCounts = {};
    entries.forEach(entry => {
      const fuelType = entry.fuelType || 'diesel';
      fuelTypeCounts[fuelType] = (fuelTypeCounts[fuelType] || 0) + (entry.liters || 0);
    });
    
    const fuelTypeNames = {
      diesel: 'Diesel',
      gasoline: 'Gasolina',
      gas: 'Gas',
      electric: 'Eléctrico',
      hybrid: 'Híbrido'
    };
    
    return {
      labels: Object.keys(fuelTypeCounts).map(type => fuelTypeNames[type] || type),
      datasets: [{
        data: Object.values(fuelTypeCounts),
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC']
      }]
    };
  });

  return {
    loading,
    errors,
    stats,
    deliveriesByStatus,
    vehiclesByStatus,
    fuelConsumptionData,
    maintenanceByType,
    fuelCostByVehicle,
    deliveriesByMonth,
    topConductores,
    fuelConsumptionByVehicle,
    distanceDistribution,
    fuelCostByMonth,
    deliveriesByProvince,
    vehiclesByType,
    fuelByType,
    fetchAllData
  };
});









