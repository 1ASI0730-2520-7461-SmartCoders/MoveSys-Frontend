export class Maintenance {
  constructor({
    id = null,
    vehicleId = null,
    vehiclePlate = '',
    model = '',
    maintenanceType = 'preventive',
    description = '',
    cost = 0,
    mileage = null,
    maintenanceDate = null,
    nextMaintenanceDate = null,
    nextMaintenanceMileage = null,
    provider = '',
    parts = [],
    mechanic = '',
    notes = '',
    status = 'scheduled'
  } = {}) {
    this.id = id;
    this.vehicleId = vehicleId;
    this.vehiclePlate = vehiclePlate;
    this.model = model;
    this.maintenanceType = maintenanceType;
    this.description = description;
    this.cost = cost;
    this.mileage = mileage;
    this.maintenanceDate = maintenanceDate;
    this.nextMaintenanceDate = nextMaintenanceDate;
    this.nextMaintenanceMileage = nextMaintenanceMileage;
    this.provider = provider;
    this.parts = parts;
    this.mechanic = mechanic;
    this.notes = notes;
    this.status = status;
  }

  get isOverdue() {
    if (!this.nextMaintenanceDate) return false;
    return new Date(this.nextMaintenanceDate) < new Date();
  }

  get isUpcoming() {
    if (!this.nextMaintenanceDate) return false;
    const today = new Date();
    const nextDate = new Date(this.nextMaintenanceDate);
    const daysUntil = (nextDate - today) / (1000 * 60 * 60 * 24);
    return daysUntil >= 0 && daysUntil <= 30;
  }

  get totalPartsCost() {
    return this.parts.reduce((total, part) => total + (part.cost || 0), 0);
  }

  static fromJSON(data) {
    return new Maintenance(data);
  }

  toJSON() {
    return {
      id: this.id,
      vehicleId: this.vehicleId,
      vehiclePlate: this.vehiclePlate,
      model: this.model,
      maintenanceType: this.maintenanceType,
      description: this.description,
      cost: this.cost,
      mileage: this.mileage,
      maintenanceDate: this.maintenanceDate,
      nextMaintenanceDate: this.nextMaintenanceDate,
      nextMaintenanceMileage: this.nextMaintenanceMileage,
      provider: this.provider,
      parts: this.parts,
      mechanic: this.mechanic,
      notes: this.notes,
      status: this.status
    };
  }
}



