import { DashboardMetrics } from '../domain/dashboard.entity.js';

export class DashboardAssembler {
  static toEntityFromResponse(response) {
    const data = response.data || response;
    return new DashboardMetrics({
      totalUsers: data.totalUsers ?? 0,
      activeUsers: data.activeUsers ?? 0,
      inactiveUsers: data.inactiveUsers ?? 0,
      totalDeliveries: data.totalDeliveries ?? 0,
      pendingDeliveries: data.pendingDeliveries ?? 0,
      completedDeliveries: data.completedDeliveries ?? 0,
      fleetAvailable: data.fleetAvailable ?? 0,
      fleetInMaintenance: data.fleetInMaintenance ?? 0,
      fuelConsumptionToday: data.fuelConsumptionToday ?? 0,
      alerts: data.alerts ?? []
    });
  }
}








