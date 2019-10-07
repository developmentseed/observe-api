import { expect } from 'chai';
import request from 'request-promise-native';
import startServer from '../app';
import db from '../app/services/db';
import logger from '../app/services/logger';

const apiUrl = `http://localhost:${process.env.PORT || 3000}`;
global.apiUrl = apiUrl;

describe('Observe API', function () {
  before(async function () {
    logger.info('Clearing database...');
    await db.schema.dropTable('knex_migrations');
    await db.schema.dropTable('users');
    await db.migrate.latest();

    logger.info('Starting server...');
    global.server = await startServer();

    logger.info('Running tests...');
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
    await global.server.stop();
  });
});
