import { Vehicle } from '../domain/vehicle.entity.js';

export class VehicleAssembler {
  static toEntityFromResource(resource) {
    return new Vehicle({
      id: resource.id || resource.Id,
      // Backend usa "Plate" pero frontend usa "licensePlate"
      licensePlate: resource.Plate || resource.plate || resource.licensePlate || resource.license_plate,
      brand: resource.Brand || resource.brand,
      model: resource.Model || resource.model,
      year: resource.Year || resource.year,
      color: resource.Color || resource.color,
      type: resource.Type || resource.type || 'truck',
      capacity: resource.Capacity || resource.capacity,
      fuelType: resource.FuelType || resource.fuelType || resource.fuel_type || 'gasoline',
      status: resource.Status || resource.status || 'available',
      currentDriver: resource.CurrentDriver || resource.currentDriver || resource.current_driver,
      mileage: resource.Mileage || resource.mileage || 0
      // Eliminamos createdAt, updatedAt, lastMaintenance, nextMaintenance
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
    // Backend espera camelCase y "Plate" en lugar de "licensePlate"
    return {
      plate: vehicle.licensePlate || vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      type: vehicle.type || 'truck',
      capacity: vehicle.capacity,
      fuelType: vehicle.fuelType || 'gasoline',
      status: vehicle.status || 'available',
      currentDriver: vehicle.currentDriver,
      mileage: vehicle.mileage || 0
    };
  }

  static toCreateResource(vehicle) {
    // Solo enviamos los campos que el usuario ingresa en el formulario
    // El backend genera automáticamente el id
    // Asegurar que el año sea un entero (no decimal)
    const year = vehicle.year != null ? Math.round(Number(vehicle.year)) : null;
    
    return {
      plate: vehicle.licensePlate || vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: year,
      color: vehicle.color || null,
      type: vehicle.type || 'truck',
      capacity: vehicle.capacity != null ? Number(vehicle.capacity) : null,
      fuelType: vehicle.fuelType || 'gasoline',
      status: vehicle.status || 'available',
      mileage: vehicle.mileage != null ? Number(vehicle.mileage) : 0
    };
  }

  static toUpdateResource(vehicle) {
    // Usar la misma lógica que toCreateResource para asegurar consistencia
    const resource = this.toCreateResource(vehicle);
    // El id va en la URL, no en el body
    return resource;
  }
}

