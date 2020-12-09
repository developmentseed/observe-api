import axios from 'axios';
import Qs from 'qs';
import config from 'config';

// Set default serializer for axios
axios.defaults.paramsSerializer = function (params) {
  return Qs.stringify(params, { arrayFormat: 'brackets' });
};

/**
 * HTTP Client class.
 */
export default class HttpClient {
  constructor () {
    this.axios = axios.create({
      baseURL: config.get('appUrl')
    });
  }

  async login (userId) {
    if (!userId) {
      throw Error('Client needs a userId to login.');
    }
    const {
      data: { accessToken }
    } = await this.axios.get(`/login?userId=${userId}`);

    this.setAuthorizationHeader(accessToken);
  }

  setAuthorizationHeader (token) {
    this.axios.defaults.headers.common['Authorization'] = token;
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
