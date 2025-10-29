import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';
import { DashboardAssembler } from './dashboard.assembler.js';

const dashboardEndpointPath = import.meta.env?.VITE_DASHBOARD_ENDPOINT_PATH || '/dashboard';

export class DashboardApi extends BaseApi {
  #endpoint

  constructor() {
    super();
    this.#endpoint = new BaseEndpoint(this, dashboardEndpointPath);
  }

  async getMetrics(params = {}) {
    const response = await this.#endpoint.getAll(params);
    return DashboardAssembler.toEntityFromResponse(response);
  }
}








