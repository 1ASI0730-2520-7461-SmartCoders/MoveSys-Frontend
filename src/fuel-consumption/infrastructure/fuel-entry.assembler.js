import { FuelEntry } from '../domain/fuel-entry.entity.js';

export class FuelEntryAssembler {
  static toEntityFromResource(resource) {
    return new FuelEntry({
      id: resource.id,
      vehicleId: resource.vehicle_id || resource.vehicleId,
      vehiclePlate: resource.vehicle_plate || resource.vehiclePlate,
      liters: resource.liters,
      cost: resource.cost,
      fuelType: resource.fuel_type || resource.fuelType,
      station: resource.station,
      filledAt: resource.filled_at || resource.filledAt,
      odometer: resource.odometer,
      notes: resource.notes,
    });
  }

  static toEntitiesFromResponse(response) {
    const data = response.data || [];
    return Array.isArray(data) ? data.map(this.toEntityFromResource) : [];
  }

  static toCreateResource(entity) {
    return {
      vehicle_id: entity.vehicleId,
      liters: entity.liters,
      cost: entity.cost,
      fuel_type: entity.fuelType,
      station: entity.station,
      filled_at: entity.filledAt,
      odometer: entity.odometer,
      notes: entity.notes,
    };
  }

  static toUpdateResource(entity) {
    return this.toCreateResource(entity);
  }
}



