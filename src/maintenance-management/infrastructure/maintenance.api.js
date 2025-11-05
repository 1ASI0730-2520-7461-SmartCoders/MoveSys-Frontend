import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';
import { MaintenanceAssembler } from './maintenance.assembler.js';

// Forzar el endpoint correcto - el backend está en /api/v1/maintenances
const maintenanceEndpointPath = '/api/v1/maintenances';

export class MaintenanceApi extends BaseApi {
  #endpoint
  constructor() {
    super();
    // Asegurar que siempre use el endpoint correcto
    const endpoint = '/api/v1/maintenances';
    console.log('🔧 MaintenanceApi inicializado con endpoint:', endpoint);
    this.#endpoint = new BaseEndpoint(this, endpoint);
  }

  async list(params = {}) {
    const response = await this.#endpoint.getAll(params);
    return MaintenanceAssembler.toEntitiesFromResponse(response);
  }

  async create(maintenance) {
    const payload = MaintenanceAssembler.toCreateResource(maintenance);
    const response = await this.#endpoint.create(payload);
    return MaintenanceAssembler.toEntityFromResource(response.data);
  }

  async update(maintenance) {
    const payload = MaintenanceAssembler.toUpdateResource(maintenance);
    const response = await this.#endpoint.update(maintenance.id, payload);
    return MaintenanceAssembler.toEntityFromResource(response.data);
  }

  async remove(id) {
    try {
      await this.#endpoint.delete(id);
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        return true;
      }
      throw error;
    }
  }
}





