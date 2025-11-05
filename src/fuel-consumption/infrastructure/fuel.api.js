import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';
import { FuelEntryAssembler } from './fuel-entry.assembler.js';

// Forzar el endpoint correcto - el backend está en /api/v1/fuel-entries
const fuelEndpointPath = '/api/v1/fuel-entries';

export class FuelApi extends BaseApi {
  #endpoint
  constructor() {
    super();
    this.#endpoint = new BaseEndpoint(this, fuelEndpointPath);
  }

  async list(params = {}) {
    const response = await this.#endpoint.getAll(params);
    return FuelEntryAssembler.toEntitiesFromResponse(response);
  }

  async create(entry) {
    const payload = FuelEntryAssembler.toCreateResource(entry);
    const response = await this.#endpoint.create(payload);
    return FuelEntryAssembler.toEntityFromResource(response.data);
  }

  async update(entry) {
    const payload = FuelEntryAssembler.toUpdateResource(entry);
    const response = await this.#endpoint.update(entry.id, payload);
    return FuelEntryAssembler.toEntityFromResource(response.data);
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


