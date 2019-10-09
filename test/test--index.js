import config from 'config';
import { expect } from 'chai';
import startServer from '../app';
import db from '../app/services/db';
import logger from '../app/services/logger';
import { Client } from './utils';

const port = config.get('port');
const apiUrl = `http://localhost:${port}`;
global.apiUrl = apiUrl;

describe('Observe API', function () {
  before(async function () {
    logger.info('Clearing database...');
    await db.schema.dropTableIfExists('knex_migrations');
    await db.schema.dropTableIfExists('users');
    await db.migrate.latest();

    logger.info('Starting server...');
    global.server = await startServer();

    logger.info('Running tests...');
  });

  describe('GET /', function () {
    it('should have status code 200', async function () {
      const client = new Client({ apiUrl });
      const { status, data } = await client.get('/');
      expect(status).to.equal(200);
      expect(data).to.equal('Observe API');
    });
  });

  require('./test-users');

  after(async function () {
    await global.server.stop();
  });
});
