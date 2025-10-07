export class Vehicle {
  constructor({
    id = null,
    licensePlate = '',
    brand = '',
    model = '',
    year = null,
    color = '',
    type = 'truck',
    capacity = null,
    fuelType = 'diesel',
    status = 'available',
    currentDriver = null,
    lastMaintenance = null,
    nextMaintenance = null,
    mileage = 0,
    createdAt = null,
    updatedAt = null
  } = {}) {
    this.id = id;
    this.licensePlate = licensePlate;
    this.brand = brand;
    this.model = model;
    this.year = year;
    this.color = color;
    this.type = type;
    this.capacity = capacity;
    this.fuelType = fuelType;
    this.status = status;
    this.currentDriver = currentDriver;
    this.lastMaintenance = lastMaintenance;
    this.nextMaintenance = nextMaintenance;
    this.mileage = mileage;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get fullName() {
    return `${this.brand} ${this.model} (${this.licensePlate})`;
  }

  get isAvailable() {
    return this.status === 'available';
  }

  get isInUse() {
    return this.status === 'in_use';
  }

  get isInMaintenance() {
    return this.status === 'maintenance';
  }

  get typeDisplayName() {
    const typeNames = {
      'truck': 'Camión',
      'van': 'Furgoneta',
      'car': 'Automóvil',
      'motorcycle': 'Motocicleta',
      'trailer': 'Remolque'
    };
    return typeNames[this.type] || this.type;
  }

  get statusDisplayName() {
    const statusNames = {
      'available': 'Disponible',
      'in_use': 'En Uso',
      'maintenance': 'Mantenimiento',
      'out_of_service': 'Fuera de Servicio'
    };
    return statusNames[this.status] || this.status;
  }

  get fuelTypeDisplayName() {
    const fuelNames = {
      'diesel': 'Diésel',
      'gasoline': 'Gasolina',
      'electric': 'Eléctrico',
      'hybrid': 'Híbrido'
    };
    return fuelNames[this.fuelType] || this.fuelType;
  }

  get maintenanceStatus() {
    if (!this.nextMaintenance) return 'unknown';
    
    const now = new Date();
    const nextMaintenance = new Date(this.nextMaintenance);
    const daysUntilMaintenance = Math.ceil((nextMaintenance - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilMaintenance < 0) return 'overdue';
    if (daysUntilMaintenance <= 7) return 'due_soon';
    if (daysUntilMaintenance <= 30) return 'due_soon';
    return 'good';
  }

  get maintenanceStatusDisplayName() {
    const statusNames = {
      'overdue': 'Vencido',
      'due_soon': 'Próximo',
      'good': 'Bueno',
      'unknown': 'Desconocido'
    };
    return statusNames[this.maintenanceStatus] || 'Desconocido';
  }

  toJSON() {
    return {
      id: this.id,
      licensePlate: this.licensePlate,
      brand: this.brand,
      model: this.model,
      year: this.year,
      color: this.color,
      type: this.type,
      capacity: this.capacity,
      fuelType: this.fuelType,
      status: this.status,
      currentDriver: this.currentDriver,
      lastMaintenance: this.lastMaintenance,
      nextMaintenance: this.nextMaintenance,
      mileage: this.mileage,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(data) {
    return new Vehicle(data);
  }
}

