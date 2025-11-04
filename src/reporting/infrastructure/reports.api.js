import { BaseApi } from '../../shared/infrastructure/base-api.js';

const reportsEndpointPath = '/api/v1/reports';

export class ReportsApi extends BaseApi {
  constructor() {
    super();
    console.log('🚀 ReportsApi constructor - Endpoint path:', reportsEndpointPath);
    console.log('🚀 Base API URL:', this.http.defaults.baseURL);
  }

  async getUnifiedOperationsReport() {
    console.log('🔍 ReportsApi.getUnifiedOperationsReport() - Endpoint:', `${reportsEndpointPath}/unified-operations`);
    const response = await this.http.get(`${reportsEndpointPath}/unified-operations`);
    return response.data;
  }

  async getDeliverySummary() {
    const response = await this.http.get(`${reportsEndpointPath}/deliveries/summary`);
    return response.data;
  }

  async getVehicleSummary() {
    const response = await this.http.get(`${reportsEndpointPath}/vehicles/summary`);
    return response.data;
  }

  async getFuelSummary() {
    const response = await this.http.get(`${reportsEndpointPath}/fuel/summary`);
    return response.data;
  }

  async getMaintenanceSummary() {
    const response = await this.http.get(`${reportsEndpointPath}/maintenance/summary`);
    return response.data;
  }
}

