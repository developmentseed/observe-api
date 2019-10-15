import axios from 'axios';
import users from '../app/models/users';
import traces from '../app/models/traces';
import Qs from 'qs';
import validTraceJson from './fixtures/valid-trace.json';

// Set default serializer for axios
axios.defaults.paramsSerializer = function (params) {
  return Qs.stringify(params, { arrayFormat: 'brackets' });
};

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
 * Factory to create mock traces at the database.
 */
export async function createMockTrace (ownerId) {
  const [trace] = await traces
    .create(validTraceJson, ownerId)
    .returning(['id', 'ownerId', 'description']);
  return trace;
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
    if (!osmId) {
      throw Error('Client needs a osmId to login.');
    }

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

  post (route, data) {
    return this.axios.post(route, data);
  }

  patch (route, data) {
    return this.axios.patch(route, data);
  }
}
