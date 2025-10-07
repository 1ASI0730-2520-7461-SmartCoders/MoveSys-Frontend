export class Delivery {
  constructor({
    id = null,
    code = '',
    customerName = '',
    address = '',
    originProvince = '',
    destinationProvince = '',
    scheduledAt = null,
    status = 'pending',
    vehicleId = null,
    vehiclePlate = '',
    etaMinutes = null,
    distanceKm = null,
    createdAt = null,
    updatedAt = null
  } = {}) {
    this.id = id;
    this.code = code;
    this.customerName = customerName;
    this.address = address;
    this.originProvince = originProvince;
    this.destinationProvince = destinationProvince;
    this.scheduledAt = scheduledAt;
    this.status = status;
    this.vehicleId = vehicleId;
    this.vehiclePlate = vehiclePlate;
    this.etaMinutes = etaMinutes;
    this.distanceKm = distanceKm;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get isPending() {
    return this.status === 'pending';
  }

  get isCompleted() {
    return this.status === 'completed';
  }
}


