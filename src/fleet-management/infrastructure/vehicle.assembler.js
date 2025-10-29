import { Vehicle } from '../domain/vehicle.entity.js';

export class VehicleAssembler {
  static toEntityFromResource(resource) {
    return new Vehicle({
      id: resource.id,
      licensePlate: resource.license_plate || resource.licensePlate,
      brand: resource.brand,
      model: resource.model,
      year: resource.year,
      color: resource.color,
      type: resource.type,
      capacity: resource.capacity,
      fuelType: resource.fuel_type || resource.fuelType,
      status: resource.status,
      currentDriver: resource.current_driver || resource.currentDriver,
      lastMaintenance: resource.last_maintenance || resource.lastMaintenance,
      nextMaintenance: resource.next_maintenance || resource.nextMaintenance,
      mileage: resource.mileage,
      createdAt: resource.created_at || resource.createdAt,
      updatedAt: resource.updated_at || resource.updatedAt
    });
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status} - ${response.statusText}`);
      return [];
    }
    const resources = Array.isArray(response.data) ? response.data : response.data?.vehicles || [];
    return resources.map(r => this.toEntityFromResource(r));
  }

  static toResource(vehicle) {
    return {
      id: vehicle.id,
      license_plate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      type: vehicle.type,
      capacity: vehicle.capacity,
      fuel_type: vehicle.fuelType,
      status: vehicle.status,
      current_driver: vehicle.currentDriver,
      last_maintenance: vehicle.lastMaintenance,
      next_maintenance: vehicle.nextMaintenance,
      mileage: vehicle.mileage
    };
  }

  static toCreateResource(vehicle) {
    const resource = this.toResource(vehicle);
    delete resource.id;
    return resource;
  }

  static toUpdateResource(vehicle) {
    return this.toResource(vehicle);
  }
}

