
export class User {
  constructor({ 
    id = null, 
    firstName = '', 
    lastName = '', 
    dni = '',
    phoneNumber = '', 
    role = 'driver',
    status = 'active'
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.dni = dni;
    this.phoneNumber = phoneNumber;
    this.role = role;
    this.status = status;
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get isActive() {
    return this.status === 'active';
  }

  get roleDisplayName() {
    const roleNames = {
      'driver': 'Conductor'
    };
    return roleNames[this.role] || this.role;
  }

  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      dni: this.dni,
      phoneNumber: this.phoneNumber,
      role: this.role,
      status: this.status
    };
  }

  static fromJSON(data) {
    return new User(data);
  }
}


