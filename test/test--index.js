import config from 'config';
import { expect } from 'chai';
import startServer from '../app';
import logger from '../app/services/logger';
import resetDb from '../test/utils/reset-db';
import Client from './utils/http-client';

const port = config.get('port');
const apiUrl = `http://localhost:${port}`;
global.apiUrl = apiUrl;

describe('Observe API', function () {
  before(async function () {
    await resetDb();

    logger.info('Starting server...');
    global.server = await startServer();

    logger.info('Running tests...');
  });

  describe('GET /', function () {
    it('should have status code 200', async function () {
      const client = new Client(apiUrl);
      const { status, data } = await client.get('/');
      expect(status).to.equal(200);
      expect(data).to.equal('Observe API');
    });
  });

  require('./test-users');
  require('./test-traces');
  require('./test-photos');

  after(async function () {
    await global.server.stop();
  });
});
