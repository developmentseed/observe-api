import db from '../app/services/db';
import { expect } from 'chai';
import { createMockUser, Client } from './utils';
import validTraceJson from './fixtures/valid-trace.json';
import cloneDeep from 'lodash.clonedeep';

/* global apiUrl */

describe.only('Traces endpoints', async function () {
  let regularUser;

  before(async function () {
    await db('users').delete();
    await db('traces').delete();

    regularUser = await createMockUser();
  });

  describe('POST /traces', function () {
    it('should return 401 for non-authenticated user', async function () {
      try {
        const client = new Client(apiUrl);
        await client.post('/traces', {});

        // The test should never reach here, force execute catch block.
        throw Error('An error was expected.');
      } catch (error) {
        // Check for the appropriate status response
        expect(error.response.status).to.equal(401);
      }
    });

    it('should return 200 for authenticated user and store trace', async function () {
      const client = new Client(apiUrl);
      await client.login(regularUser.osmId);
      const { status, data } = await client.post('/traces', {
        tracejson: validTraceJson
      });

      expect(status).to.equal(200);

      const { timestamps, description } = validTraceJson.properties;
      const recordedAt = new Date(timestamps[0]).toISOString();
      expect(data.properties).to.have.property('id');
      expect(data.properties).to.have.property('uploadedAt');
      expect(data.properties).to.have.property('updatedAt');
      expect(data.properties.length).greaterThan(0);
      expect(data.properties.description).to.deep.equal(description);
      expect(data.properties.timestamps).to.deep.equal(timestamps);
      expect(data.properties.recordedAt).to.deep.equal(recordedAt);

      expect(data.geometry).to.deep.equal(validTraceJson.geometry);
      expect(data.geometry).to.deep.equal(validTraceJson.geometry);
    });

    it('reject invalid tracejson', async function () {
      try {
        const invalidTraceJson = cloneDeep(validTraceJson);
        invalidTraceJson.properties.timestamps.pop();

        const client = new Client(apiUrl);
        await client.login(regularUser.osmId);
        await client.post('/traces', { tracejson: invalidTraceJson });

        // The test should never reach here, force execute catch block.
        throw Error('An error was expected.');
      } catch (error) {
        // Check for the appropriate status response
        expect(error.response.status).to.equal(400);
        expect(error.response.data.message).to.equal(
          'Invalid request payload input'
        );
      }
    });
  });
});
