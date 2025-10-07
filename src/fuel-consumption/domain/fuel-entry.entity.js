export class FuelEntry {
  constructor({
    id = null,
    vehicleId = null,
    vehiclePlate = '',
    liters = 0,
    cost = 0,
    fuelType = 'diesel',
    station = '',
    filledAt = null,
    odometer = null,
    notes = ''
  } = {}) {
    this.id = id;
    this.vehicleId = vehicleId;
    this.vehiclePlate = vehiclePlate;
    this.liters = liters;
    this.cost = cost;
    this.fuelType = fuelType;
    this.station = station;
    this.filledAt = filledAt;
    this.odometer = odometer;
    this.notes = notes;
  }

  get costPerLiter() {
    if (!this.liters) return 0;
    return this.cost / this.liters;
  }
}


