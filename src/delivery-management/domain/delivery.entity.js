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
    driverName = '',
    etaMinutes = null,
    distanceKm = null
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
    this.driverName = driverName;
    this.etaMinutes = etaMinutes;
    this.distanceKm = distanceKm;
  }

  get isPending() {
    return this.status === 'pending';
  }

  get isCompleted() {
    return this.status === 'completed';
  }
}


