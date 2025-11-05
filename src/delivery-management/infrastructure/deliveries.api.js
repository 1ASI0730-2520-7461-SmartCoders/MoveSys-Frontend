import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';
import { DeliveryAssembler } from './delivery.assembler.js';

// Forzar el endpoint correcto - el backend está en /api/v1/deliveries
const deliveriesEndpointPath = '/api/v1/deliveries';

export class DeliveriesApi extends BaseApi {
  #endpoint

  constructor() {
    super();
    const endpoint = '/api/v1/deliveries';
    this.#endpoint = new BaseEndpoint(this, endpoint);
  }

  async list(params = {}) {
    const response = await this.#endpoint.getAll(params);
    return DeliveryAssembler.toEntitiesFromResponse(response);
  }

  async getById(id) {
    const response = await this.#endpoint.getById(id);
    return DeliveryAssembler.toEntityFromResource(response.data);
  }

  async create(delivery) {
    const payload = DeliveryAssembler.toCreateResource(delivery);
    const response = await this.#endpoint.create(payload);
    return DeliveryAssembler.toEntityFromResource(response.data);
  }

  async update(delivery) {
    const payload = DeliveryAssembler.toUpdateResource(delivery);
    const response = await this.#endpoint.update(delivery.id, payload);
    // El backend devuelve NoContent (204), así que obtenemos la entrega actualizada
    if (response.status === 204 || !response.data) {
      return await this.getById(delivery.id);
    }
    return DeliveryAssembler.toEntityFromResource(response.data);
  }

  async remove(id) {
    await this.#endpoint.delete(id);
  }

  async search(query, params = {}) {
    const response = await this.#endpoint.search(query, params);
    return DeliveryAssembler.toEntitiesFromResponse(response);
  }
}


