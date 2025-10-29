export class DashboardMetrics {
  constructor({
    totalUsers = 0,
    activeUsers = 0,
    inactiveUsers = 0,
    totalDeliveries = 0,
    pendingDeliveries = 0,
    completedDeliveries = 0,
    fleetAvailable = 0,
    fleetInMaintenance = 0,
    fuelConsumptionToday = 0,
    alerts = []
  } = {}) {
    this.totalUsers = totalUsers;
    this.activeUsers = activeUsers;
    this.inactiveUsers = inactiveUsers;
    this.totalDeliveries = totalDeliveries;
    this.pendingDeliveries = pendingDeliveries;
    this.completedDeliveries = completedDeliveries;
    this.fleetAvailable = fleetAvailable;
    this.fleetInMaintenance = fleetInMaintenance;
    this.fuelConsumptionToday = fuelConsumptionToday;
    this.alerts = alerts;
  }
}








