import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';
import { ConductorAssembler } from './conductor.assembler.js';

// Endpoint actualizado - el backend ahora usa /api/v1/drivers
const conductoresEndpointPath = '/api/v1/drivers';

export class ConductoresApi extends BaseApi {
  #conductoresEndpoint

  constructor() {
    super();
    // Endpoint actualizado a /api/v1/drivers
    const endpoint = '/api/v1/drivers';
    console.log('🚀 ConductoresApi constructor - Endpoint path:', endpoint);
    console.log('🚀 Base API URL:', this.http.defaults.baseURL);
    this.#conductoresEndpoint = new BaseEndpoint(this, endpoint);
    console.log('🚀 Endpoint configurado:', this.#conductoresEndpoint.endpointPath);
  }

  async list(params = {}) {
    console.log('🔍 ConductoresApi.list() - Endpoint:', this.#conductoresEndpoint.endpointPath);
    const response = await this.#conductoresEndpoint.getAll(params);
    return ConductorAssembler.toEntitiesFromResponse(response);
  }

  async getById(id) {
    const response = await this.#conductoresEndpoint.getById(id);
    return ConductorAssembler.toEntityFromResource(response.data);
  }

  async create(conductor) {
    console.log('📝 ConductoresApi.create() - Endpoint:', this.#conductoresEndpoint.endpointPath);
    console.log('📝 Payload:', JSON.stringify(ConductorAssembler.toCreateResource(conductor), null, 2));
    const payload = ConductorAssembler.toCreateResource(conductor);
    const response = await this.#conductoresEndpoint.create(payload);
    return ConductorAssembler.toEntityFromResource(response.data);
  }

  async update(conductor) {
    const payload = ConductorAssembler.toUpdateResource(conductor);
    const response = await this.#conductoresEndpoint.update(conductor.id, payload);
    // El backend devuelve NoContent (204), así que obtenemos el conductor actualizado
    if (response.status === 204 || !response.data) {
      return await this.getById(conductor.id);
    }
    return ConductorAssembler.toEntityFromResource(response.data);
  }

  async remove(id) {
    await this.#conductoresEndpoint.delete(id);
  }

  async search(query, params = {}) {
    const response = await this.#conductoresEndpoint.search(query, params);
    return ConductorAssembler.toEntitiesFromResponse(response);
  }

  async getByRole(role) {
    return this.list({ role });
  }

  async getActiveConductores() {
    return this.list({ status: 'active' });
  }

  async updateStatus(id, status) {
    // El backend espera "status" en minúsculas según el controlador
    const response = await this.#conductoresEndpoint.patch(id, { status: status });
    // El backend devuelve NoContent (204), así que obtenemos el conductor actualizado
    if (response.status === 204 || !response.data) {
      return await this.getById(id);
    }
    return ConductorAssembler.toEntityFromResource(response.data);
  }
}


