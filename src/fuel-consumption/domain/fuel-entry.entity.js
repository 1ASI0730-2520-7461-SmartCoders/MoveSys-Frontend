export class FuelEntry {
  constructor({
    id = null,
    vehicleId = null,
    vehiclePlate = '',
    model = '',
    liters = 0,
    costPerLiter = 0,
    totalPaid = 0,
    fuelType = 'diesel',
    provider = '',
    filledAt = null,
    odometer = null,
    notes = ''
  } = {}) {
    this.id = id;
    this.vehicleId = vehicleId;
    this.vehiclePlate = vehiclePlate;
    this.model = model;
    this.liters = liters;
    this.costPerLiter = costPerLiter;
    this.totalPaid = totalPaid;
    this.fuelType = fuelType;
    this.provider = provider;
    this.filledAt = filledAt;
    this.odometer = odometer;
    this.notes = notes;
  }

  get cost() {
    return this.totalPaid || (this.liters * this.costPerLiter);
  }

  get calculatedTotal() {
    return this.liters * this.costPerLiter;
  }
}
