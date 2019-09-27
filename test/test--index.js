import { expect } from 'chai';
import request from 'request-promise-native';
import initServer from '../app';

let server;
const apiUrl = `http://localhost:${process.env.PORT || 3000}`;

describe('Observe API', function () {
  before(async function () {
    server = await initServer();
    global.server = server;
    global.apiUrl = apiUrl;
  });

  describe('GET /', function () {
    it('should have status code 200', async function () {
      const { body, statusCode } = await request({
        uri: apiUrl + '/',
        resolveWithFullResponse: true
      });

      expect(statusCode).to.equal(200);

      expect(body).to.equal('Observe API');
    });
  });

  after(async function () {
    await server.stop();
  });
});
