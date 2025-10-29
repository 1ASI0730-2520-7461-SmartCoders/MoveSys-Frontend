import { Maintenance } from '../domain/maintenance.entity.js';

export class MaintenanceAssembler {
  static toEntityFromResource(resource) {
    return new Maintenance({
      id: resource.id,
      vehicleId: resource.vehicle_id || resource.vehicleId,
      vehiclePlate: resource.vehicle_plate || resource.vehiclePlate,
      model: resource.model,
      maintenanceType: resource.maintenance_type || resource.maintenanceType || 'preventive',
      description: resource.description,
      cost: resource.cost || 0,
      mileage: resource.mileage,
      maintenanceDate: resource.maintenance_date || resource.maintenanceDate,
      nextMaintenanceDate: resource.next_maintenance_date || resource.nextMaintenanceDate,
      nextMaintenanceMileage: resource.next_maintenance_mileage || resource.nextMaintenanceMileage,
      provider: resource.provider,
      parts: resource.parts || [],
      mechanic: resource.mechanic,
      notes: resource.notes,
      status: resource.status || 'scheduled'
    });
  }

  static toEntitiesFromResponse(response) {
    const data = response.data || [];
    return Array.isArray(data) ? data.map(this.toEntityFromResource) : [];
  }

  static toCreateResource(entity) {
    return {
      vehicle_id: entity.vehicleId,
      vehicle_plate: entity.vehiclePlate,
      model: entity.model,
      maintenance_type: entity.maintenanceType,
      description: entity.description,
      cost: entity.cost,
      mileage: entity.mileage,
      maintenance_date: entity.maintenanceDate,
      next_maintenance_date: entity.nextMaintenanceDate,
      next_maintenance_mileage: entity.nextMaintenanceMileage,
      provider: entity.provider,
      parts: entity.parts,
      mechanic: entity.mechanic,
      notes: entity.notes,
      status: entity.status
    };
  }

  static toUpdateResource(entity) {
    return this.toCreateResource(entity);
  }
}



