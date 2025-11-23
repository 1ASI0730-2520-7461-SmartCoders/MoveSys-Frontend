import { BaseApi } from './base-api.js';

export class AuthApi extends BaseApi {
  async signUp(data) {
    const response = await this.http.post('/api/v1/authentication/sign-up', {
      email: data.email,
      password: data.password
    });
    return response.data;
  }

  async signIn(email, password) {
    const response = await this.http.post('/api/v1/authentication/sign-in', {
      username: email, // El backend usa "username" pero acepta el email
      password: password
    });
    return response.data;
  }
}


