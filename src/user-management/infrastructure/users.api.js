import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';
import { UserAssembler } from './user.assembler.js';

// Forzar el endpoint correcto - el backend está en /api/v1/users
const usersEndpointPath = '/api/v1/users';

export class UsersApi extends BaseApi {
  #usersEndpoint

  constructor() {
    super();
    // Forzar el endpoint correcto
    const endpoint = '/api/v1/users';
    console.log('🚀 UsersApi constructor - Endpoint path:', endpoint);
    console.log('🚀 Base API URL:', this.http.defaults.baseURL);
    this.#usersEndpoint = new BaseEndpoint(this, endpoint);
    console.log('🚀 Endpoint configurado:', this.#usersEndpoint.endpointPath);
  }

  async list(params = {}) {
    console.log('🔍 UsersApi.list() - Endpoint:', this.#usersEndpoint.endpointPath);
    const response = await this.#usersEndpoint.getAll(params);
    return UserAssembler.toEntitiesFromResponse(response);
  }

  async getById(id) {
    const response = await this.#usersEndpoint.getById(id);
    return UserAssembler.toEntityFromResource(response.data);
  }

  async create(user) {
    console.log('📝 UsersApi.create() - Endpoint:', this.#usersEndpoint.endpointPath);
    console.log('📝 Payload:', JSON.stringify(UserAssembler.toCreateResource(user), null, 2));
    const payload = UserAssembler.toCreateResource(user);
    const response = await this.#usersEndpoint.create(payload);
    return UserAssembler.toEntityFromResource(response.data);
  }

  async update(user) {
    const payload = UserAssembler.toUpdateResource(user);
    const response = await this.#usersEndpoint.update(user.id, payload);
    // El backend devuelve NoContent (204), así que obtenemos el usuario actualizado
    if (response.status === 204 || !response.data) {
      return await this.getById(user.id);
    }
    return UserAssembler.toEntityFromResource(response.data);
  }

  async remove(id) {
    await this.#usersEndpoint.delete(id);
  }

  async search(query, params = {}) {
    const response = await this.#usersEndpoint.search(query, params);
    return UserAssembler.toEntitiesFromResponse(response);
  }

  async getByRole(role) {
    return this.list({ role });
  }

  async getActiveUsers() {
    return this.list({ status: 'active' });
  }

  async updateStatus(id, status) {
    // El backend espera "status" en minúsculas según el controlador
    const response = await this.#usersEndpoint.patch(id, { status: status });
    // El backend devuelve NoContent (204), así que obtenemos el usuario actualizado
    if (response.status === 204 || !response.data) {
      return await this.getById(id);
    }
    return UserAssembler.toEntityFromResource(response.data);
  }

  async changePassword(id, currentPassword, newPassword) {
    const response = await this.#usersEndpoint.patch(id, {
      current_password: currentPassword,
      new_password: newPassword
    });
    return response.data;
  }

  async resetPassword(email) {
    const response = await this.#usersEndpoint.patch('reset-password', { email });
    return response.data;
  }
}


