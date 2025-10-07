import { Delivery } from '../domain/delivery.entity.js';

export class DeliveryAssembler {
  static toEntityFromResource(resource) {
    return new Delivery({
      id: resource.id,
      code: resource.code,
      customerName: resource.customerName,
      address: resource.address,
      originProvince: resource.origin_province || resource.originProvince,
      destinationProvince: resource.destination_province || resource.destinationProvince,
      scheduledAt: resource.scheduledAt ? new Date(resource.scheduledAt) : null,
      status: resource.status,
      vehicleId: resource.vehicleId,
      vehiclePlate: resource.vehicle_plate || resource.vehiclePlate,
      driverName: resource.driverName,
      distanceKm: resource.distance_km || resource.distanceKm,
      etaMinutes: resource.eta_minutes || resource.etaMinutes,
      createdAt: resource.createdAt ? new Date(resource.createdAt) : null,
      updatedAt: resource.updatedAt ? new Date(resource.updatedAt) : null,
    });
  }

  static toEntitiesFromResponse(response) {
    const data = response.data || [];
    return Array.isArray(data) ? data.map(this.toEntityFromResource) : [];
  }

  static toCreateResource(entity) {
    return {
      code: entity.code,
      customerName: entity.customerName,
      address: entity.address,
      origin_province: entity.originProvince,
      destination_province: entity.destinationProvince,
      scheduledAt: entity.scheduledAt,
      status: entity.status,
      vehicleId: entity.vehicleId,
      vehicle_plate: entity.vehiclePlate,
      driverName: entity.driverName,
      distance_km: entity.distanceKm,
      eta_minutes: entity.etaMinutes,
    };
  }

  static toUpdateResource(entity) {
    return this.toCreateResource(entity);
  }
}


