import axios from 'axios';
import Client from './utils/http-client';
import config from 'config';
import db from '../app/services/db';
import orderBy from 'lodash.orderby';
import path from 'path';
import { countPhotos, getPhoto } from '../app/models/photos';
import { createMockUser, createMockPhoto } from './utils/mock-factory';
import { expect, should } from 'chai';
import { getAllMediaUrls } from '../app/services/media-store';
import { readFile } from 'fs-extra';

const paginationLimit = config.get('pagination.limit');

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
        heading: 8,
        description: 'a description',
        createdAt: new Date().toISOString(),
        osmElement: 'way/677949489'
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
      expect(data).to.have.property(
        'ownerDisplayName',
        regularUser.osmDisplayName
      );
      expect(data).to.have.property('createdAt', metadata.createdAt);
      expect(data).to.have.property('description', metadata.description);
      expect(data).to.have.property('heading', metadata.heading);
      expect(data).to.have.property('osmElement', metadata.osmElement);
      expect(data.urls).to.deep.equal(getAllMediaUrls(data.id));
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
        await client.get('/photos/ABCDEFGHIJKLMNO');

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
        await client.get('/photos/ABCDEFGHIJKLMNO');

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
        heading: 272,
        createdAt: new Date().toISOString(),
        osmElement: 'node/55555'
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
      expect(data).to.have.property(
        'ownerDisplayName',
        regularUser.osmDisplayName
      );
      expect(data).to.have.property('createdAt', metadata.createdAt);
      expect(data).to.have.property('heading', metadata.heading);
      expect(data.urls).to.deep.equal(getAllMediaUrls(id));
      expect(data.osmElement).to.deep.equal(metadata.osmElement);
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
          osmElement: 'way/677949489'
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
          heading: 8,
          createdAt: new Date().toISOString(),
          osmElement: 'node/677949489'
        });

        // Create user 2 to try patch photo from user 1
        const regularUser2 = await createMockUser();
        const client2 = new Client(apiUrl);
        await client2.login(regularUser2.osmId);
        await client2.patch(`/photos/${id}`, {
          heading: 12
        });

        // This line should not be reached in tests, throw error.
        throw Error('An error was expected.');
      } catch (error) {
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
        await client.patch('/photos/ABCDEFGHIJKLMNO');

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
        heading: 272,
        createdAt: new Date().toISOString(),
        osmElement: 'relation/9999999'
      });

      const patchData = {
        description: 'A new description',
        heading: 50,
        lon: 30,
        lat: 22,
        osmElement: 'node/222222'
      };

      // Perform patch
      const { status, data } = await client.patch(`/photos/${id}`, {
        ...patchData
      });

      // Check status
      expect(status).to.equal(200);

      // Patch method returns empty responses
      expect(data).to.deep.equal({});

      // Load photo and compare
      const updatedPhoto = await getPhoto(id);
      expect(updatedPhoto.heading).to.deep.equal(patchData.heading);
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
        heading: 272,
        createdAt: new Date().toISOString(),
        osmElement: 'node/55555'
      });

      // Create client for admin user
      const adminUser = await createMockUser({ isAdmin: true });
      const adminClient = new Client(apiUrl);
      await adminClient.login(adminUser.osmId);

      // Set patch data
      const patchData = {
        heading: 134,
        osmElement: 'node/123123123'
      };

      // Perform patch with admin
      const { status, data } = await adminClient.patch(
        `/photos/${id}`,
        patchData
      );

      // Check status
      expect(status).to.equal(200);

      // Patch method returns empty responses
      expect(data).to.deep.equal({});

      // Load photo and compare
      const updatedPhoto = await getPhoto(id);
      expect(updatedPhoto.heading).to.deep.equal(patchData.heading);
    });
  });

  describe('DEL /photos/{id}', async function () {
    it('return 401 for non-authenticated user', async function () {
      try {
        const client = new Client(apiUrl);
        await client.del(`/photos/abcdefghi`);

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
        const regularUser1 = await createMockUser();
        const regularUser2 = await createMockUser();
        const photo = await createMockPhoto(regularUser1);

        const client = new Client(apiUrl);
        await client.login(regularUser2.osmId);
        await client.del(`/photos/${photo.id}`);

        // This line should be reached, force executing the catch block with
        // generic error.
        throw Error('An error was expected.');
      } catch (error) {
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
        await client.del('/photos/ABCDEFGHIJKLMNO');

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

      // Create mock photo
      const photo = await createMockPhoto(regularUser);

      // Get photo count
      const beforeCount = await countPhotos();

      // Do the request
      const { status, data } = await client.del(`/photos/${photo.id}`);

      // Check status
      expect(status).to.equal(200);

      // DEL method returns empty responses
      expect(data).to.deep.equal({});

      // Check if photo was deleted
      const deletedPhoto = await getPhoto(photo.id);
      should().not.exist(deletedPhoto);

      // Check if photos count was reduced by one
      const afterCount = await countPhotos();
      expect(afterCount).to.eq(beforeCount - 1);
    });

    it('return 200 for non-owner admin', async function () {
      // Create client
      const regularUser = await createMockUser();
      const adminUser = await createMockUser({ isAdmin: true });
      const adminClient = new Client(apiUrl);
      await adminClient.login(adminUser.osmId);

      // Create mock photo
      const photo = await createMockPhoto(regularUser);

      // Get photo count
      const beforeCount = await countPhotos();

      // Do the request
      const { status, data } = await adminClient.del(`/photos/${photo.id}`);

      // Check status
      expect(status).to.equal(200);

      // DEL method returns empty responses
      expect(data).to.deep.equal({});

      // Check if photo was deleted
      const deletedPhoto = await getPhoto(photo.id);
      should().not.exist(deletedPhoto);

      // Check if photos count was reduced by one
      const afterCount = await countPhotos();
      expect(afterCount).to.eq(beforeCount - 1);
    });
  });

  describe('GET /photos', async function () {
    const photos = [];
    let regularUser, adminUser;

    before(async function () {
      regularUser = await createMockUser();
      adminUser = await createMockUser({ isAdmin: true });

      // Clear existing users
      await db('photos').delete();

      // Create 20 photos for regular user
      for (let i = 0; i < 20; i++) {
        photos.push(await createMockPhoto(regularUser));
      }

      // Create 30 photos for admin user
      for (let i = 0; i < 30; i++) {
        photos.push(await createMockPhoto(adminUser));
      }
    });

    it('return 401 for non-authenticated user', async function () {
      try {
        const client = new Client(apiUrl);
        await client.get('/photos');

        // The test should never reach here, force execute catch block.
        throw Error('An error was expected.');
      } catch (error) {
        // Check for the appropriate status response
        expect(error.response.status).to.equal(401);
      }
    });

    it('return 200 for regular user', async function () {
      const client = new Client(apiUrl);
      await client.login(regularUser.osmId);
      const { status } = await client.get('/photos');
      expect(status).to.equal(200);
    });

    it('return 200 for admin user', async function () {
      const client = new Client(apiUrl);
      await client.login(adminUser.osmId);
      const { status } = await client.get('/photos');
      expect(status).to.equal(200);
    });

    it('default query order by "uploadedAt", follow limit default', async function () {
      const client = new Client(apiUrl);
      await client.login(adminUser.osmId);

      // Prepare expected response for default query
      let expectedResponse = orderBy(photos, 'uploadedAt', 'desc').slice(
        0,
        paginationLimit
      );

      // Default query, should be order by display name and match limit
      const { status, data } = await client.get('/photos');
      expect(status).to.equal(200);
      expect(data.meta.totalCount).to.eq(50);
      expect(data.results).to.deep.equal(expectedResponse);
    });

    it('check paginated query and sorting by one column', async function () {
      const client = new Client(apiUrl);
      await client.login(adminUser.osmId);

      // Prepare expected response for page 3, ordering by creation date
      const page = 3;
      const offset = paginationLimit * (page - 1);
      const expectedResponse = orderBy(photos, 'uploadedAt').slice(
        offset,
        offset + paginationLimit
      );

      const res = await client.get('/photos', {
        params: {
          page,
          sort: { uploadedAt: 'asc' }
        }
      });
      expect(res.data.meta.totalCount).to.eq(50);
      expect(res.data.results).to.deep.equal(expectedResponse);
    });

    it('check another page and sorting by two columns', async function () {
      const client = new Client(apiUrl);
      await client.login(adminUser.osmId);

      // Prepare expected response for page 3, ordering by creation date
      const page = 2;
      const offset = paginationLimit * (page - 1);
      const expectedResponse = orderBy(
        photos,
        ['description', 'uploadedAt'],
        ['desc', 'asc']
      ).slice(offset, offset + paginationLimit);

      const res = await client.get('/photos', {
        params: {
          page,
          sort: { description: 'desc', uploadedAt: 'asc' }
        }
      });
      expect(res.data.meta.totalCount).to.eq(50);
      expect(res.data.results).to.deep.equal(expectedResponse);
    });

    it('invalid query params return 400 status and proper error', async function () {
      try {
        const client = new Client(apiUrl);
        await client.login(adminUser.osmId);

        const page = 2;
        const invalidSort = {
          invalidColumn: 'asc'
        };

        await client.get('/photos', {
          params: {
            page,
            sort: invalidSort
          }
        });

        // The test should never reach here, force execute catch block.
        throw Error('An error was expected.');
      } catch (error) {
        // Check for the appropriate status response
        expect(error.response.data.message).to.equal(
          '"sort.invalidColumn" is not allowed'
        );
        expect(error.response.status).to.equal(400);
      }
    });
  });
});
