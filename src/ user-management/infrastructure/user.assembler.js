import { User } from '../domain/user.entity.js';

export class UserAssembler {
  static toEntityFromResource(resource) {
    return new User({
      id: resource.id,
      firstName: resource.firstName || resource.first_name,
      lastName: resource.lastName || resource.last_name,
      dni: resource.dni,
      phoneNumber: resource.phoneNumber || resource.phone_number,
      role: 'driver',
      status: 'active',
      createdAt: resource.createdAt || resource.created_at,
      updatedAt: resource.updatedAt || resource.updated_at,
      lastLogin: resource.lastLogin || resource.last_login
    });
  }

  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status} - ${response.statusText}`);
      return [];
    }
    const resources = Array.isArray(response.data) ? response.data : response.data?.users || [];
    return resources.map(r => this.toEntityFromResource(r));
  }

  static toResource(user) {
    return {
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      dni: user.dni,
      phone_number: user.phoneNumber,
      role: 'driver',
      status: 'active'
    };
  }

  static toCreateResource(user) {
    const resource = this.toResource(user);
    delete resource.id; // Remove ID for creation
    return resource;
  }

  static toUpdateResource(user) {
    return this.toResource(user);
  }
}

