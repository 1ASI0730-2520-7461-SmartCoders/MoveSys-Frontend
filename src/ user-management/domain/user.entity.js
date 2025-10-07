
export class User {
  constructor({ 
    id = null, 
    firstName = '', 
    lastName = '', 
    dni = '',
    phoneNumber = '', 
    role = 'driver',
    status = 'active',
    createdAt = null,
    updatedAt = null,
    lastLogin = null
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.dni = dni;
    this.phoneNumber = phoneNumber;
    this.role = role;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.lastLogin = lastLogin;
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
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLogin: this.lastLogin
    };
  }

  static fromJSON(data) {
    return new User(data);
  }
}


