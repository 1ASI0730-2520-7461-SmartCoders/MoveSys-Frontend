import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';
import { MaintenanceAssembler } from '../../maintenance.assembler.js';

const maintenanceEndpointPath = import.meta.env?.VITE_MAINTENANCE_ENDPOINT_PATH || '/maintenances';

export class MaintenanceApi extends BaseApi {
    #endpoint
    constructor() {
        super();
        this.#endpoint = new BaseEndpoint(this, maintenanceEndpointPath);
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



