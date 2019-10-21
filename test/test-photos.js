import config from 'config';
import db from '../app/services/db';
import { expect } from 'chai';
import { createMockUser } from './utils/mock-factory';
import Client from './utils/http-client';
import { readFile } from 'fs-extra';
import path from 'path';
import { getAllMediaUrls } from '../app/services/media-store';
import axios from 'axios';

/* global apiUrl */

const mediaSizes = config.get('media.sizes');

describe('Photos endpoints', async function () {
  before(async function () {
    await db('users').delete();
    await db('photos').delete();
  });

  describe('POST /photos', function () {
    it('return 401 for non-authenticated user', async function () {
      try {
        const client = new Client(apiUrl);
        await client.post('/photos', {});

        // This line should be reached, force executing the catch block with
        // generic error.
        throw Error('An error was expected.');
      } catch (error) {
        // Check for the appropriate status response
        expect(error.response.status).to.equal(401);
      }
    });

    it('return 200 for authenticated user and store photo', async function () {
      // Create authenticated client
      const regularUser = await createMockUser();
      const client = new Client(apiUrl);
      await client.login(regularUser.osmId);

      // Get .jpg file as base64
      const file = (await readFile(
        path.join(__dirname, './fixtures/photo.jpg')
      )).toString('base64');

      // Set metadata data
      const metadata = {
        lon: 30,
        lat: -30,
        bearing: 8,
        createdAt: new Date().toISOString(),
        osmObjects: ['way/677949489', 'node/677949489', 'relation/10203930293']
      };

      // Post request
      const { status, data } = await client.post('/photos', {
        file,
        ...metadata
      });

      expect(status).to.equal(200);

      expect(data).to.have.property('id');
      expect(data).to.have.property('uploadedAt');
      expect(data).to.have.property('ownerId', regularUser.osmId);
      expect(data).to.have.property('createdAt', metadata.createdAt);
      expect(data).to.have.property('bearing', metadata.bearing);
      expect(data.urls).to.deep.equal(getAllMediaUrls(data.id));
      expect(data.osmObjects).to.deep.equal(metadata.osmObjects);
      expect(data.location).to.deep.equal({
        type: 'Point',
        coordinates: [metadata.lon, metadata.lat]
      });

      // Check if media file is available at URLs provided
      for (let i = 0; i < mediaSizes.length; i++) {
        const size = mediaSizes[i].id;
        const url = data.urls[size];
        const { status } = await axios.get(url);
        expect(status).to.equal(200);
      }
    });
  });

  describe('GET /photos/{id}', function () {
    it('return 401 for non-authenticated user', async function () {
      try {
        const client = new Client(apiUrl);
        await client.get('/photos/abcdefghij');

        // The test should never reach here, force execute catch block.
        throw Error('An error was expected.');
      } catch (error) {
        // Check for the appropriate status response
        expect(error.response.status).to.equal(401);
      }
    });

    it('return 404 for non-existing photo', async function () {
      try {
        // Create client
        const regularUser = await createMockUser();
        const client = new Client(apiUrl);
        await client.login(regularUser.osmId);

        // Fetch resource
        await client.get('/photos/abcdefghij');

        // The test should never reach here, force execute catch block.
        throw Error('An error was expected.');
      } catch (error) {
        // Check for the appropriate status response
        expect(error.response.status).to.equal(404);
      }
    });

    it('return 200 for existing photo', async function () {
      // Create authenticated client
      const regularUser = await createMockUser();
      const client = new Client(apiUrl);
      await client.login(regularUser.osmId);

      // Get .jpg file as base64
      const file = (await readFile(
        path.join(__dirname, './fixtures/photo.jpg')
      )).toString('base64');

      // Set metadata data
      const metadata = {
        lon: 40,
        lat: -13,
        bearing: 272,
        createdAt: new Date().toISOString(),
        osmObjects: ['way/62239489', 'node/55555', 'relation/9999999']
      };

      // Post request
      const {
        data: { id }
      } = await client.post('/photos', { file, ...metadata });

      // Fetch resource
      const { status, data } = await client.get(`/photos/${id}`);

      expect(status).to.equal(200);

      expect(data).to.have.property('id');
      expect(data).to.have.property('uploadedAt');
      expect(data).to.have.property('ownerId', regularUser.osmId);
      expect(data).to.have.property('createdAt', metadata.createdAt);
      expect(data).to.have.property('bearing', metadata.bearing);
      expect(data.urls).to.deep.equal(getAllMediaUrls(id));
      expect(data.osmObjects).to.deep.equal(metadata.osmObjects);
      expect(data.location).to.deep.equal({
        type: 'Point',
        coordinates: [metadata.lon, metadata.lat]
      });
    });
  });

  describe('PATCH /photos/{id}', async function () {
    it('return 401 for non-authenticated user', async function () {
      try {
        const client = new Client(apiUrl);
        await client.patch(`/photos/abcdefghi`, {
          osmObjects: [
            'way/677949489',
            'node/677949489',
            'relation/10203930293'
          ]
        });

        // This line should be reached, force executing the catch block with
        // generic error.
        throw Error('An error was expected.');
      } catch (error) {
        // Check for the appropriate status response
        expect(error.response.status).to.equal(401);
      }
    });

    it('return 403 for non-owner user', async function () {
      try {
        // Get .jpg file as base64
        const file = (await readFile(
          path.join(__dirname, './fixtures/photo.jpg')
        )).toString('base64');

        // Create user 1 and photo
        const regularUser1 = await createMockUser();
        const client1 = new Client(apiUrl);
        await client1.login(regularUser1.osmId);

        const {
          data: { id }
        } = await client1.post('/photos', {
          file,
          lon: 30,
          lat: -30,
          bearing: 8,
          createdAt: new Date().toISOString(),
          osmObjects: [
            'way/677949489',
            'node/677949489',
            'relation/10203930293'
          ]
        });

        // Create user 2 to try patch photo from user 1
        const regularUser2 = await createMockUser();
        const client2 = new Client(apiUrl);
        await client2.login(regularUser2.osmId);
        await client2.patch(`/photos/${id}`, {
          bearing: 12
        });

        // This line should not be reached in tests, throw error.
        throw Error('An error was expected.');
      } catch (error) {
        // console.log(error);
        // Check for the appropriate status response
        expect(error.response.status).to.equal(403);
      }
    });

    it('return 404 for non-existing photo', async function () {
      try {
        // Create client
        const regularUser = await createMockUser();
        const client = new Client(apiUrl);
        await client.login(regularUser.osmId);

        // Fetch resource
        await client.patch('/photos/abcdefghij');

        // The test should never reach here, force execute catch block.
        throw Error('An error was expected.');
      } catch (error) {
        // Check for the appropriate status response
        expect(error.response.status).to.equal(404);
      }
    });

    it('return 200 for owner', async function () {
      // Create client
      const regularUser = await createMockUser();
      const client = new Client(apiUrl);
      await client.login(regularUser.osmId);

      // Get .jpg file as base64
      const file = (await readFile(
        path.join(__dirname, './fixtures/photo.jpg')
      )).toString('base64');

      // Post request
      const {
        data: { id }
      } = await client.post('/photos', {
        file,
        lon: 40,
        lat: -13,
        bearing: 272,
        createdAt: new Date().toISOString(),
        osmObjects: ['way/62239489', 'node/55555', 'relation/9999999']
      });

      const patchData = {
        bearing: 50,
        lon: 30,
        lat: 22,
        osmObjects: [
          'node/222222',
          'way/33333',
          'relation/523423423',
          'relation/12312312',
          'node/123123',
          'node/123123123'
        ]
      };

      // Perform patch
      await client.patch(`/photos/${id}`, {
        ...patchData
      });

      // Get photo
      const { status, data } = await client.get(`/photos/${id}`);

      // Check status
      expect(status).to.equal(200);

      // Check response
      expect(data).to.have.property('id');
      expect(data).to.have.property('createdAt');
      expect(data).to.have.property('uploadedAt');
      expect(data.bearing).to.equal(patchData.bearing);
      expect(data.location).to.deep.equal({
        type: 'Point',
        coordinates: [30, 22]
      });
      expect(data.osmObjects).to.deep.equal(patchData.osmObjects);
    });

    it('return 200 for admin', async function () {
      // Create client for regular user
      const regularUser = await createMockUser();
      const client = new Client(apiUrl);
      await client.login(regularUser.osmId);

      // Get .jpg file as base64
      const file = (await readFile(
        path.join(__dirname, './fixtures/photo.jpg')
      )).toString('base64');

      // Post request
      const {
        data: { id }
      } = await client.post('/photos', {
        file,
        lon: 40,
        lat: -13,
        bearing: 272,
        createdAt: new Date().toISOString(),
        osmObjects: ['way/62239489', 'node/55555', 'relation/9999999']
      });

      // Create client for admin user
      const adminUser = await createMockUser({ isAdmin: true });
      const adminClient = new Client(apiUrl);
      await adminClient.login(adminUser.osmId);

      // Set patch data
      const patchData = {
        bearing: 134,
        osmObjects: ['node/222222', 'node/123123', 'node/123123123']
      };

      // Perform patch with admin
      const { status, data } = await adminClient.patch(
        `/photos/${id}`,
        patchData
      );

      // Check status
      expect(status).to.equal(200);

      // Check response
      expect(data).to.have.property('id');
      expect(data).to.have.property('createdAt');
      expect(data).to.have.property('uploadedAt');
      expect(data.bearing).to.equal(patchData.bearing);
      expect(data.location).to.deep.equal({
        type: 'Point',
        coordinates: [40, -13]
      });
      expect(data.osmObjects).to.deep.equal(patchData.osmObjects);
    });
  });
});
