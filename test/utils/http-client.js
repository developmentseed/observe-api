import axios from 'axios';
import Qs from 'qs';

// Set default serializer for axios
axios.defaults.paramsSerializer = function (params) {
  return Qs.stringify(params, { arrayFormat: 'brackets' });
};

/**
 * HTTP Client class.
 */
export default class HttpClient {
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

  del (route) {
    return this.axios.delete(route);
  }
}
