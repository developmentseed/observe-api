import axios from 'axios';
import users from '../app/models/users';

let usersCount = 0;

/**
 * Factory to create mock users at the database.
 */
export async function createMockUser () {
  usersCount = usersCount + 1;
  const profile = {
    osmId: usersCount,
    osmDisplayName: 'User' + usersCount,
    osmCreatedAt: new Date().toISOString()
  };
  const [user] = await users.create(profile).returning('*');
  return user;
}

/**
 * HTTP Client class.
 */
export class Client {
  constructor ({ apiUrl, osmId }) {
    this.apiUrl = apiUrl;
    this.osmId = osmId;
    this.axios = axios.create({
      baseURL: apiUrl
    });
  }

  async login () {
    const {
      data: { accessToken }
    } = await this.axios.get(`/login?osmId=${this.osmId}`);

    // Replace axios instance with an authenticated one
    this.axios = axios.create({
      baseURL: this.apiUrl,
      headers: { Authorization: accessToken }
    });
  }

  get (route) {
    return this.axios.get(route);
  }
}
