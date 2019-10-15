import db from '../app/services/db';
import { expect } from 'chai';
import { createMockUser, Client, createMockTrace } from './utils';
import validTraceJson from './fixtures/valid-trace.json';
import cloneDeep from 'lodash.clonedeep';
import traces from '../app/models/traces';

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

        // This line should be reached, force executing the catch block with
        // generic error.
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

        // This line should be reached, force executing the catch block with
        // generic error.
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

        // This line should be reached, force executing the catch block with
        // generic error.
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

        // This line should be reached, force executing the catch block with
        // generic error.
        throw Error('An error was expected.');
      } catch (error) {
        // Check for the appropriate status response
        expect(error.response.status).to.equal(403);
      }
    });

    it('should return 200 for owner', async function () {
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
  describe('DEL /traces', async function () {
    it('should return 401 for non-authenticated user', async function () {
      try {
        const client = new Client(apiUrl);
        await client.del(`/traces/abcdefghi`);

        // This line should be reached, force executing the catch block with
        // generic error.
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
        await client.del(`/traces/${trace.id}`);

        // This line should be reached, force executing the catch block with
        // generic error.
        throw Error('An error was expected.');
      } catch (error) {
        // Check for the appropriate status response
        expect(error.response.status).to.equal(403);
      }
    });

    it('should return 200 for owner', async function () {
      // Create client
      const regularUser = await createMockUser();
      const client = new Client(apiUrl);
      await client.login(regularUser.osmId);

      // Create mock trace
      const trace = await createMockTrace(regularUser.osmId);
      await createMockTrace(regularUser.osmId);

      // Get trace count
      const beforeCount = await traces.count();

      // Do the request
      const { status } = await client.del(`/traces/${trace.id}`);

      // Check status
      expect(status).to.equal(200);

      // Check if trace was deleted
      const deletedTrace = await traces.get(trace.id);
      expect(deletedTrace).to.have.length(0);

      // Check if traces count was reduced by one
      const afterCount = await traces.count();
      expect(afterCount).to.eq(beforeCount - 1);
    });

    it('should return 200 for non-owner admin', async function () {
      // Create client
      const regularUser = await createMockUser();
      const adminUser = await createMockUser({isAdmin: true});
      const client = new Client(apiUrl);
      await client.login(adminUser.osmId);

      // Create mock trace
      const trace = await createMockTrace(regularUser.osmId);
      await createMockTrace(regularUser.osmId);

      // Get trace count
      const beforeCount = await traces.count();

      // Do the request
      const { status } = await client.del(`/traces/${trace.id}`);

      // Check status
      expect(status).to.equal(200);

      // Check if trace was deleted
      const deletedTrace = await traces.get(trace.id);
      expect(deletedTrace).to.have.length(0);

      // Check if traces count was reduced by one
      const afterCount = await traces.count();
      expect(afterCount).to.eq(beforeCount - 1);
    });
  });
});
