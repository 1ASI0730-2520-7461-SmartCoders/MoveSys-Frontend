import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';
import { VehicleAssembler } from './vehicle.assembler.js';

const vehiclesEndpointPath = import.meta.env?.VITE_VEHICLES_ENDPOINT_PATH || '/vehicles';

export class VehiclesApi extends BaseApi {
  #vehiclesEndpoint

  constructor() {
    super();
    this.#vehiclesEndpoint = new BaseEndpoint(this, vehiclesEndpointPath);
  }

  async list(params = {}) {
    const response = await this.#vehiclesEndpoint.getAll(params);
    return VehicleAssembler.toEntitiesFromResponse(response);
  }

  async getById(id) {
    const response = await this.#vehiclesEndpoint.getById(id);
    return VehicleAssembler.toEntityFromResource(response.data);
  }

  async create(vehicle) {
    const payload = VehicleAssembler.toCreateResource(vehicle);
    const response = await this.#vehiclesEndpoint.create(payload);
    return VehicleAssembler.toEntityFromResource(response.data);
  }

  async update(vehicle) {
    const payload = VehicleAssembler.toUpdateResource(vehicle);
    const response = await this.#vehiclesEndpoint.update(vehicle.id, payload);
    return VehicleAssembler.toEntityFromResource(response.data);
  }

  async remove(id) {
    await this.#vehiclesEndpoint.delete(id);
  }

  async search(query, params = {}) {
    const response = await this.#vehiclesEndpoint.search(query, params);
    return VehicleAssembler.toEntitiesFromResponse(response);
  }

  async getByStatus(status) {
    return this.list({ status });
  }

  async getAvailableVehicles() {
    return this.list({ status: 'available' });
  }

  async updateStatus(id, status) {
    const response = await this.#vehiclesEndpoint.patch(id, { status });
    return VehicleAssembler.toEntityFromResource(response.data);
  }

  async assignDriver(id, driverName) {
    try {
      const response = await this.#vehiclesEndpoint.patch(id, { 
        current_driver: driverName,
        status: 'in_use'
      });
      return VehicleAssembler.toEntityFromResource(response.data);
    } catch (error) {
      // Fallback PUT completo para compatibilidad
      const getResp = await this.#vehiclesEndpoint.getById(id);
      const resource = getResp.data;
      const merged = { ...resource, current_driver: driverName, status: 'in_use' };
      const putResp = await this.#vehiclesEndpoint.update(id, merged);
      return VehicleAssembler.toEntityFromResource(putResp.data);
    }
  }

  async unassignDriver(id) {
    const response = await this.#vehiclesEndpoint.patch(id, { 
      current_driver: null,
      status: 'available'
    });
    return VehicleAssembler.toEntityFromResource(response.data);
  }

  async updateMileage(id, mileage) {
    const response = await this.#vehiclesEndpoint.patch(id, { mileage });
    return VehicleAssembler.toEntityFromResource(response.data);
  }

  async scheduleMaintenance(id, nextMaintenance) {
    const response = await this.#vehiclesEndpoint.patch(id, { 
      next_maintenance: nextMaintenance 
    });
    return VehicleAssembler.toEntityFromResource(response.data);
  }

  async getMaintenanceDue() {
    return this.list({ maintenance_due: true });
  }

  async getFleetStatistics() {
    const response = await this.#vehiclesEndpoint.getAll({ statistics: true });
    return response.data;
  }
}

