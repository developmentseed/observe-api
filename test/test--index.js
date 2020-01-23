import { expect } from 'chai';
import startServer from '../app';
import db from '../app/services/db';
import logger from '../app/services/logger';
import { clearMediaStore } from '../app/services/media-store';
import Client from './utils/http-client';

describe('Observe API', function () {
  before(async function () {
    logger.info('Clearing database...');
    await db.schema.dropTableIfExists('knex_migrations');
    await db.schema.dropTableIfExists('users');
    await db.schema.dropTableIfExists('traces');
    await db.schema.dropTableIfExists('photos');
    await db.migrate.latest();
    await clearMediaStore();

    logger.info('Starting server...');
    global.server = await startServer();

    logger.info('Running tests...');
  });

  describe('GET /', function () {
    it('should have status code 200', async function () {
      const client = new Client();
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
