import db from '../app/services/db';
import { expect } from 'chai';
import { createMockUser, Client, createMockTrace } from './utils';
import validTraceJson from './fixtures/valid-trace.json';
import cloneDeep from 'lodash.clonedeep';

/* global apiUrl */

describe('Traces endpoints', async function () {
  before(async function () {
    await db('users').delete();
    await db('traces').delete();
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
      const regularUser = await createMockUser();
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

        const regularUser = await createMockUser();
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

  describe('PATCH /traces', async function () {
    it('should return 401 for non-authenticated user', async function () {
      try {
        const client = new Client(apiUrl);
        await client.patch(`/traces/abcdefghi`, {
          description: 'a new description'
        });

        // The test should never reach here, force execute catch block.
        throw Error('An error was expected.');
      } catch (error) {
        // Check for the appropriate status response
        expect(error.response.status).to.equal(401);
      }
    });

    it('should return 403 for non-owner user', async function () {
      try {
        const regularUser1 = await createMockUser();
        const regularUser2 = await createMockUser();
        const trace = await createMockTrace(regularUser1.osmId);

        const client = new Client(apiUrl);
        await client.login(regularUser2.osmId);
        await client.patch(`/traces/${trace.id}`, {
          description: 'a new description'
        });

        // The test should never reach here, force execute catch block.
        throw Error('An error was expected.');
      } catch (error) {
        // Check for the appropriate status response
        expect(error.response.status).to.equal(403);
      }
    });

    it('should return 200 for valid payload', async function () {
      // Data to be patched
      const newDescription = 'a new description';

      // Create client
      const regularUser = await createMockUser();
      const client = new Client(apiUrl);
      await client.login(regularUser.osmId);

      // Create mock trace
      const trace = await createMockTrace(regularUser.osmId);

      // Do the request
      const { status, data } = await client.patch(`/traces/${trace.id}`, {
        description: 'a new description'
      });

      // Check status
      expect(status).to.equal(200);

      // Check response
      const { timestamps } = validTraceJson.properties;
      const recordedAt = new Date(timestamps[0]).toISOString();
      expect(data.properties).to.have.property('id');
      expect(data.properties).to.have.property('uploadedAt');
      expect(data.properties).to.have.property('updatedAt');
      expect(data.properties.length).greaterThan(0);
      expect(data.properties.description).to.deep.equal(newDescription);
      expect(data.properties.timestamps).to.deep.equal(timestamps);
      expect(data.properties.recordedAt).to.deep.equal(recordedAt);

      expect(data.geometry).to.deep.equal(validTraceJson.geometry);
      expect(data.geometry).to.deep.equal(validTraceJson.geometry);
    });
  });
});
