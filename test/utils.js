import axios from 'axios';
import users from '../app/models/users';

/**
 * Generate random integer number up to "max" value.
 * @param {integer} max
 */
function getRandomInt (max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/**
 * Factory to create mock users at the database.
 */
export async function createMockUser (data) {
  // Randomize id and display name separately to test sorting.
  const profile = {
    osmId: getRandomInt(100000),
    osmDisplayName: 'User' + getRandomInt(100000),
    osmCreatedAt: new Date().toISOString()
  };
  const [user] = await users.create({ ...profile, ...data }).returning('*');
  return user;
}

/**
 * HTTP Client class.
 */
export class Client {
  constructor (apiUrl) {
    this.apiUrl = apiUrl;
    this.axios = axios.create({
      baseURL: apiUrl
    });
  }

  async login (osmId) {
    const {
      data: { accessToken }
    } = await this.axios.get(`/login?osmId=${osmId}`);

    // Replace axios instance with an authenticated one
    this.axios = axios.create({
      baseURL: this.apiUrl,
      headers: { Authorization: accessToken }
    });
  }

  get (route, params) {
    return this.axios.get(route, params);
  }
}
