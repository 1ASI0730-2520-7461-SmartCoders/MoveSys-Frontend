import { FuelEntry } from '../domain/fuel-entry.entity.js';

export class FuelEntryAssembler {
  static toEntityFromResource(resource) {
    // El backend devuelve PascalCase, pero también puede devolver camelCase
    return new FuelEntry({
      id: resource.Id || resource.id,
      vehicleId: resource.VehicleId || resource.vehicleId || resource.vehicle_id,
      vehiclePlate: resource.VehiclePlate || resource.vehiclePlate || resource.vehicle_plate,
      model: resource.Model || resource.model,
      liters: resource.Liters || resource.liters,
      costPerLiter: resource.CostPerLiter || resource.costPerLiter || resource.cost_per_liter,
      totalPaid: resource.TotalPaid || resource.totalPaid || resource.total_paid,
      fuelType: resource.FuelType || resource.fuelType || resource.fuel_type,
      provider: resource.Provider || resource.provider,
      filledAt: resource.FilledAt || resource.filledAt || resource.filled_at,
      odometer: resource.Odometer || resource.odometer,
      notes: resource.Notes || resource.notes,
    });
  }

  static toEntitiesFromResponse(response) {
    const data = response.data || [];
    return Array.isArray(data) ? data.map(this.toEntityFromResource) : [];
  }

  static toCreateResource(entity) {
    // El backend espera PascalCase (VehiclePlate, Liters, CostPerLiter, etc.)
    // Asegurar que los valores numéricos se conviertan correctamente
    const liters = entity.liters != null && entity.liters !== '' ? Number(entity.liters) : 0;
    const costPerLiter = entity.costPerLiter != null && entity.costPerLiter !== '' ? Number(entity.costPerLiter) : 0;
    const totalPaid = entity.totalPaid != null && entity.totalPaid !== '' ? Number(entity.totalPaid) : (liters * costPerLiter);
    
    return {
      VehicleId: entity.vehicleId || null,
      VehiclePlate: entity.vehiclePlate || '',
      Model: entity.model || null,
      Liters: liters,
      CostPerLiter: costPerLiter,
      TotalPaid: totalPaid,
      FuelType: entity.fuelType || 'diesel',
      Provider: entity.provider || '',
      FilledAt: entity.filledAt || null,
      Odometer: entity.odometer != null && entity.odometer !== '' ? Number(entity.odometer) : null,
      Notes: entity.notes || null
    };
  }

  static toUpdateResource(entity) {
    return this.toCreateResource(entity);
  }
}






