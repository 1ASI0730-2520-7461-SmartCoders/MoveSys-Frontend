import { Conductor } from '../domain/conductor.entity.js';

export class ConductorAssembler {
  static toEntityFromResource(resource) {
    return new Conductor({
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
    const resources = Array.isArray(response.data) ? response.data : response.data?.conductores || [];
    return resources.map(r => this.toEntityFromResource(r));
  }

  static toResource(conductor) {
    // El backend acepta camelCase (formato estándar de APIs REST)
    return {
      firstName: conductor.firstName,
      lastName: conductor.lastName,
      dni: conductor.dni,
      phoneNumber: conductor.phoneNumber,
      role: conductor.role || 'driver',
      status: conductor.status || 'active'
    };
  }

  static toCreateResource(conductor) {
    // Solo enviamos los campos que el usuario ingresa en el formulario
    // El backend genera automáticamente el id
    return {
      firstName: conductor.firstName,
      lastName: conductor.lastName,
      dni: conductor.dni,
      phoneNumber: conductor.phoneNumber,
      role: conductor.role || 'driver',
      status: conductor.status || 'active'
    };
  }

  static toUpdateResource(conductor) {
    const resource = this.toResource(conductor);
    delete resource.Id; // El Id va en la URL, no en el body
    return resource;
  }
}


