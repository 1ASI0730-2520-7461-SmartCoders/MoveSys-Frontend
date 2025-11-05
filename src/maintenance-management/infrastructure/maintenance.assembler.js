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
    // El backend acepta camelCase (formato estándar de APIs REST)
    // El campo 'parts' debe ser un string JSON, no un array
    let partsString = null;
    if (entity.parts && Array.isArray(entity.parts) && entity.parts.length > 0) {
      // Filtrar partes vacías antes de serializar
      const validParts = entity.parts.filter(p => p && (p.name || p.cost > 0));
      if (validParts.length > 0) {
        partsString = JSON.stringify(validParts);
      }
    }
    
    // Asegurar que description tenga un valor (es requerido)
    const description = entity.description && entity.description.trim() !== '' 
      ? entity.description.trim() 
      : '';
    
    const resource = {
      vehicleId: entity.vehicleId || null,
      vehiclePlate: entity.vehiclePlate || '',
      model: entity.model || null,
      maintenanceType: entity.maintenanceType || 'preventive',
      description: description,
      cost: entity.cost != null && entity.cost !== '' ? Number(entity.cost) : 0,
      mileage: entity.mileage != null && entity.mileage !== '' ? Number(entity.mileage) : null,
      maintenanceDate: entity.maintenanceDate || null,
      nextMaintenanceDate: entity.nextMaintenanceDate || null,
      nextMaintenanceMileage: entity.nextMaintenanceMileage != null && entity.nextMaintenanceMileage !== '' ? Number(entity.nextMaintenanceMileage) : null,
      provider: entity.provider || '',
      parts: partsString,
      mechanic: entity.mechanic || null,
      notes: entity.notes || null,
      status: entity.status || 'scheduled'
    };
    
    console.log('🔧 MaintenanceAssembler - Datos a enviar al backend:', resource);
    return resource;
  }

  static toUpdateResource(entity) {
    return this.toCreateResource(entity);
  }
}





