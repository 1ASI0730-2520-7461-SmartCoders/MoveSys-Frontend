import { FuelEntry } from '../domain/fuel-entry.entity.js';

export class FuelEntryAssembler {
  static toEntityFromResource(resource) {
    return new FuelEntry({
      id: resource.id,
      vehicleId: resource.vehicle_id || resource.vehicleId,
      vehiclePlate: resource.vehicle_plate || resource.vehiclePlate,
      model: resource.model,
      liters: resource.liters,
      costPerLiter: resource.cost_per_liter || resource.costPerLiter,
      totalPaid: resource.total_paid || resource.totalPaid,
      fuelType: resource.fuel_type || resource.fuelType,
      provider: resource.provider,
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
      vehicle_plate: entity.vehiclePlate,
      model: entity.model,
      liters: entity.liters,
      cost_per_liter: entity.costPerLiter,
      total_paid: entity.totalPaid,
      fuel_type: entity.fuelType,
      provider: entity.provider,
      filled_at: entity.filledAt,
      odometer: entity.odometer,
      notes: entity.notes,
    };
  }

  static toUpdateResource(entity) {
    return this.toCreateResource(entity);
  }
}






