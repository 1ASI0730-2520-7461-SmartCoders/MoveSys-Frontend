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
    // El backend acepta camelCase (formato estándar de APIs REST)
    // Asegurar que los valores numéricos se conviertan correctamente
    const liters = entity.liters != null && entity.liters !== '' ? Number(entity.liters) : 0;
    const costPerLiter = entity.costPerLiter != null && entity.costPerLiter !== '' ? Number(entity.costPerLiter) : 0;
    
    return {
      vehicleId: entity.vehicleId || null,
      vehiclePlate: entity.vehiclePlate || '',
      model: entity.model || null,
      liters: liters,
      costPerLiter: costPerLiter,
      totalPaid: entity.totalPaid != null && entity.totalPaid !== '' ? Number(entity.totalPaid) : null,
      fuelType: entity.fuelType || 'diesel',
      provider: entity.provider || '',
      filledAt: entity.filledAt || null,
      odometer: entity.odometer != null && entity.odometer !== '' ? Number(entity.odometer) : null,
      notes: entity.notes || null
    };
  }

  static toUpdateResource(entity) {
    return this.toCreateResource(entity);
  }
}






