import { Delivery } from '../domain/delivery.entity.js';

export class DeliveryAssembler {
  static toEntityFromResource(resource) {
    return new Delivery({
      id: resource.id || resource.Id,
      code: resource.Code || resource.code,
      customerName: resource.CustomerName || resource.customerName,
      address: resource.Address || resource.address,
      originProvince: resource.OriginProvince || resource.originProvince || resource.origin_province,
      destinationProvince: resource.DestinationProvince || resource.destinationProvince || resource.destination_province,
      scheduledAt: resource.ScheduledAt || resource.scheduledAt ? new Date(resource.ScheduledAt || resource.scheduledAt) : null,
      status: resource.Status || resource.status || 'pending',
      vehicleId: resource.VehicleId || resource.vehicleId,
      vehiclePlate: resource.VehiclePlate || resource.vehiclePlate || resource.vehicle_plate,
      driverName: resource.DriverName || resource.driverName,
      distanceKm: resource.DistanceKm || resource.distanceKm || resource.distance_km,
      etaMinutes: resource.EtaMinutes || resource.etaMinutes || resource.eta_minutes
      // Eliminamos createdAt y updatedAt
    });
  }

  static toEntitiesFromResponse(response) {
    const data = response.data || [];
    return Array.isArray(data) ? data.map(this.toEntityFromResource) : [];
  }

  static toCreateResource(entity) {
    // El backend acepta camelCase (formato estándar de APIs REST)
    return {
      code: entity.code,
      customerName: entity.customerName,
      address: entity.address,
      originProvince: entity.originProvince,
      destinationProvince: entity.destinationProvince,
      scheduledAt: entity.scheduledAt,
      status: entity.status || 'pending',
      vehicleId: entity.vehicleId,
      vehiclePlate: entity.vehiclePlate,
      driverName: entity.driverName,
      distanceKm: entity.distanceKm,
      etaMinutes: entity.etaMinutes
    };
  }

  static toUpdateResource(entity) {
    // El id va en la URL, no en el body
    // Asegurar que todos los campos requeridos estén presentes
    const resource = {
      code: entity.code || '',
      customerName: entity.customerName || '',
      address: entity.address || '',
      originProvince: entity.originProvince || '',
      destinationProvince: entity.destinationProvince || '',
      status: entity.status || 'pending',
      // Campos opcionales - solo enviar si tienen valor
      ...(entity.scheduledAt && { scheduledAt: entity.scheduledAt }),
      ...(entity.vehicleId && { vehicleId: entity.vehicleId }),
      ...(entity.vehiclePlate && { vehiclePlate: entity.vehiclePlate }),
      ...(entity.driverName && { driverName: entity.driverName }),
      ...(entity.distanceKm !== null && entity.distanceKm !== undefined && { distanceKm: entity.distanceKm }),
      ...(entity.etaMinutes !== null && entity.etaMinutes !== undefined && { etaMinutes: entity.etaMinutes })
    };
    return resource;
  }
}


