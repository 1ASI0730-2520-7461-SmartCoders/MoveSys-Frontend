import { User } from '../domain/user.entity.js';

export class UserAssembler {
  static toEntityFromResource(resource) {
    return new User({
      id: resource.id || resource.Id,
      firstName: resource.FirstName || resource.firstName || resource.first_name,
      lastName: resource.LastName || resource.lastName || resource.last_name,
      dni: resource.Dni || resource.dni,
      phoneNumber: resource.PhoneNumber || resource.phoneNumber || resource.phone_number,
      role: resource.Role || resource.role || 'driver',
      status: resource.Status || resource.status || 'active'
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
    // El backend acepta camelCase (formato estándar de APIs REST)
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      dni: user.dni,
      phoneNumber: user.phoneNumber,
      role: user.role || 'driver',
      status: user.status || 'active'
    };
  }

  static toCreateResource(user) {
    // Solo enviamos los campos que el usuario ingresa en el formulario
    // El backend genera automáticamente el id
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      dni: user.dni,
      phoneNumber: user.phoneNumber,
      role: user.role || 'driver',
      status: user.status || 'active'
    };
  }

  static toUpdateResource(user) {
    const resource = this.toResource(user);
    delete resource.Id; // El Id va en la URL, no en el body
    return resource;
  }
}

