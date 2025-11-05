import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';
import { VehicleAssembler } from './vehicle.assembler.js';

// Forzar el endpoint correcto - el backend está en /api/v1/vehicles
const vehiclesEndpointPath = '/api/v1/vehicles';

export class VehiclesApi extends BaseApi {
  #vehiclesEndpoint

  constructor() {
    super();
    const endpoint = '/api/v1/vehicles';
    this.#vehiclesEndpoint = new BaseEndpoint(this, endpoint);
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
    // El backend devuelve NoContent (204), así que obtenemos el vehículo actualizado
    if (response.status === 204 || !response.data) {
      return await this.getById(vehicle.id);
    }
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
    // El backend devuelve NoContent (204), así que obtenemos el vehículo actualizado
    if (response.status === 204 || !response.data) {
      return await this.getById(id);
    }
    return VehicleAssembler.toEntityFromResource(response.data);
  }

  async assignDriver(id, driverName) {
    // El backend espera camelCase: currentDriver (no current_driver)
    const response = await this.#vehiclesEndpoint.patch(id, { 
      currentDriver: driverName,
      status: 'in_use'
    });
    // El backend devuelve NoContent (204), así que obtenemos el vehículo actualizado
    if (response.status === 204 || !response.data) {
      return await this.getById(id);
    }
    return VehicleAssembler.toEntityFromResource(response.data);
  }

  async unassignDriver(id) {
    const response = await this.#vehiclesEndpoint.patch(id, { 
      currentDriver: null,
      status: 'available'
    });
    // El backend devuelve NoContent (204), así que obtenemos el vehículo actualizado
    if (response.status === 204 || !response.data) {
      return await this.getById(id);
    }
    return VehicleAssembler.toEntityFromResource(response.data);
  }

  async updateMileage(id, mileage) {
    const response = await this.#vehiclesEndpoint.patch(id, { mileage });
    // El backend devuelve NoContent (204), así que obtenemos el vehículo actualizado
    if (response.status === 204 || !response.data) {
      return await this.getById(id);
    }
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

