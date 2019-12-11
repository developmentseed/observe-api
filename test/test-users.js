import config from 'config';
import orderBy from 'lodash.orderby';
import db from '../app/services/db';
import { expect } from 'chai';
import { createMockUser } from './utils/mock-factory';
import Client from './utils/http-client';
import { delay } from '../app/utils';
const paginationLimit = config.get('pagination.limit');

/* global apiUrl */

describe('Users endpoints', function () {
  const users = [];
  let adminUser;
  let regularUser;

  before(async function () {
    // Clear existing users
    await db('users').delete();

    // Create 5 admins
    for (let i = 0; i < 5; i++) {
      users.push(await createMockUser({ isAdmin: true }));
      await delay(1);
    }

    // Get one admin for testing
    adminUser = users[0];

    // Create more 45 users
    for (let i = 0; i < 45; i++) {
      users.push(await createMockUser());
      await delay(1);
    }

    // Get regular user for testing
    regularUser = users[users.length - 1];
  });

  describe('GET /users', function () {
    it('should return 401 for non-authenticated user', async function () {
      try {
        const client = new Client(apiUrl);
        await client.get('/users');

        // The test should never reach here, force execute catch block.
        throw Error('An error was expected.');
      } catch (error) {
        // Check for the appropriate status response
        expect(error.response.status).to.equal(401);
      }
    });

    it('should return 200 for regular user', async function () {
      const client = new Client(apiUrl);
      await client.login(regularUser.osmId);
      const { status } = await client.get('/users');
      expect(status).to.equal(200);
    });

    it('should return 200 for admin user', async function () {
      const client = new Client(apiUrl);
      await client.login(adminUser.osmId);
      const { status } = await client.get('/users');
      expect(status).to.equal(200);
    });

    it('follow default query order and default limit', async function () {
      const client = new Client(apiUrl);
      await client.login(adminUser.osmId);

      // Prepare expected response for default query
      let expectedResponse = orderBy(
        users,
        ['isAdmin', 'osmCreatedAt'],
        ['desc', 'asc']
      ).slice(0, paginationLimit);

      // Default query, should be order by display name and match limit
      const res = await client.get('/users');
      expect(res.data.meta.totalCount).to.eq(50);

      // Check if results follow the same order
      for (let i = 0; i < expectedResponse.length; i++) {
        const expected = expectedResponse[i];
        const found = res.data.results[i];

        // Remove properties not covered by this test
        delete found.photos;
        delete found.traces;

        expect(expected).to.deep.equal(found);
      }
    });

    it('check paginated query and sorting by one column', async function () {
      const client = new Client(apiUrl);
      await client.login(adminUser.osmId);

      // Prepare expected response for page 3, ordering by creation date
      const page = 3;
      const offset = paginationLimit * (page - 1);
      const expectedResponse = orderBy(users, 'osmCreatedAt').slice(
        offset,
        offset + paginationLimit
      );

      const res = await client.get('/users', {
        params: {
          page,
          sort: { createdAt: 'asc' }
        }
      });
      expect(res.data.meta.totalCount).to.eq(50);

      // Check if results follow the same order
      for (let i = 0; i < expectedResponse.length; i++) {
        const expected = expectedResponse[i];
        const found = res.data.results[i];

        // Remove properties not covered by this test
        delete found.photos;
        delete found.traces;

        expect(expected).to.deep.equal(found);
      }
    });

    it('check another page and sorting by two columns', async function () {
      const client = new Client(apiUrl);
      await client.login(adminUser.osmId);

      // Prepare expected response for page 3, ordering by creation date
      const page = 2;
      const offset = paginationLimit * (page - 1);
      const expectedResponse = orderBy(
        users,
        ['osmDisplayName', 'osmCreatedAt'],
        ['desc', 'asc']
      ).slice(offset, offset + paginationLimit);

      const res = await client.get('/users', {
        params: {
          page,
          sort: { username: 'desc', createdAt: 'asc' }
        }
      });
      expect(res.data.meta.totalCount).to.eq(50);

      // Check if results follow the same order
      for (let i = 0; i < expectedResponse.length; i++) {
        const expected = expectedResponse[i];
        const found = res.data.results[i];

        // Remove properties not covered by this test
        delete found.photos;
        delete found.traces;

        expect(expected).to.deep.equal(found);
      }
    });

    it('invalid query params should 400 and return proper error', async function () {
      try {
        const client = new Client(apiUrl);
        await client.login(adminUser.osmId);

        const page = 2;
        const invalidSort = {
          invalidColumn: 'asc'
        };

        await client.get('/users', {
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

  describe('GET /profile', async function () {
    it('returns 401 for non-authenticated user', async function () {
      try {
        const client = new Client(apiUrl);
        await client.get('/profile');

        // The test should never reach here, force execute catch block.
        throw Error('An error was expected.');
      } catch (error) {
        // Check for the appropriate status response
        expect(error.response.status).to.equal(401);
      }
    });

    it('returns 200 and profile for authenticated user', async function () {
      const user = await createMockUser();
      const client = new Client(apiUrl);
      await client.login(user.osmId);

      // Default query, should be order by display name and match limit
      const { data } = await client.get('/profile');
      expect(data).to.deep.eq(user);
    });
  });
});
