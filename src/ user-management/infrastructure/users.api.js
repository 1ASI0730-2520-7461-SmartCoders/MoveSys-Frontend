import { BaseApi } from '../../shared/infrastructure/base-api.js';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint.js';
import { UserAssembler } from './user.assembler.js';

const usersEndpointPath = import.meta.env?.VITE_USERS_ENDPOINT_PATH || '/users';

export class UsersApi extends BaseApi {
  #usersEndpoint

  constructor() {
    super();
    this.#usersEndpoint = new BaseEndpoint(this, usersEndpointPath);
  }

  async list(params = {}) {
    const response = await this.#usersEndpoint.getAll(params);
    return UserAssembler.toEntitiesFromResponse(response);
  }

  async getById(id) {
    const response = await this.#usersEndpoint.getById(id);
    return UserAssembler.toEntityFromResource(response.data);
  }

  async create(user) {
    const payload = UserAssembler.toCreateResource(user);
    const response = await this.#usersEndpoint.create(payload);
    return UserAssembler.toEntityFromResource(response.data);
  }

  async update(user) {
    const payload = UserAssembler.toUpdateResource(user);
    const response = await this.#usersEndpoint.update(user.id, payload);
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
    const response = await this.#usersEndpoint.patch(id, { status });
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


