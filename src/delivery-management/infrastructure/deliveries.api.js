import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';
import { DeliveryAssembler } from './delivery.assembler.js';

const deliveriesEndpointPath = import.meta.env?.VITE_DELIVERIES_ENDPOINT_PATH || '/deliveries';

export class DeliveriesApi extends BaseApi {
  #endpoint

  constructor() {
    super();
    this.#endpoint = new BaseEndpoint(this, deliveriesEndpointPath);
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
    try {
      const response = await this.#endpoint.update(delivery.id, payload);
      return DeliveryAssembler.toEntityFromResource(response.data);
    } catch (error) {
      // Fallback a PATCH si PUT no está mapeado
      const response = await this.#endpoint.patch(delivery.id, payload);
      return DeliveryAssembler.toEntityFromResource(response.data);
    }
  }

  async remove(id) {
    await this.#endpoint.delete(id);
  }

  async search(query, params = {}) {
    const response = await this.#endpoint.search(query, params);
    return DeliveryAssembler.toEntitiesFromResponse(response);
  }
}


