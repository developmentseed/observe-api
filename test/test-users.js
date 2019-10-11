import config from 'config';
import orderBy from 'lodash.orderby';
import db from '../app/services/db';
import { expect } from 'chai';
import { createMockUser, Client } from './utils';
const paginationLimit = config.get('pagination.limit');

/* global apiUrl */

describe('User management', function () {
  const users = [];
  let adminUser;
  let regularUser;

  before(async function () {
    await db('users').delete();

    // Create 5 admins
    for (let i = 0; i < 5; i++) {
      users.push(await createMockUser({ isAdmin: true }));
    }

    // Get admin user for testing
    adminUser = users[0];

    // Create more 45 users
    for (let i = 0; i < 45; i++) {
      users.push(await createMockUser());
    }

    // Get regular user for testing
    regularUser = users[users.length - 1];

    // Parse date to string for easy comparison
    users.map(r => {
      r.osmCreatedAt = r.osmCreatedAt.toISOString();
      return r;
    });
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

    it('should return 401 for regular user', async function () {
      try {
        const client = new Client(apiUrl);
        await client.login(regularUser.osmId);
        await client.get('/users');

        // The test should never reach here, force execute catch block.
        throw Error('An error was expected.');
      } catch (error) {
        // Check for the appropriate status response
        expect(error.response.status).to.equal(401);
      }
    });

    it('should return 200 for admin user', async function () {
      const client = new Client(apiUrl);
      await client.login(adminUser.osmId);
      const { status } = await client.get('/users');
      expect(status).to.equal(200);
    });

    it('default query should order by osmDisplayName and follow default limit', async function () {
      const client = new Client(apiUrl);
      await client.login(adminUser.osmId);

      // Prepare expected response for default query
      let expectedResponse1 = orderBy(users, 'osmDisplayName').slice(
        0,
        paginationLimit
      );

      // Default query, should be order by display name and match limit
      const res = await client.get('/users');
      expect(res.data.meta.totalCount).to.eq(50);
      expect(res.data.results).to.deep.equal(expectedResponse1);
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
          sort: { osmCreatedAt: 'asc' }
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
        users,
        ['osmDisplayName', 'osmCreatedAt'],
        ['desc', 'asc']
      ).slice(offset, offset + paginationLimit);

      const res = await client.get('/users', {
        params: {
          page,
          sort: { osmDisplayName: 'desc', osmCreatedAt: 'asc' }
        }
      });
      expect(res.data.meta.totalCount).to.eq(50);
      expect(res.data.results).to.deep.equal(expectedResponse);
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
        expect(error.response.data.message).to.equal('Invalid request query input');
        expect(error.response.status).to.equal(400);
      }
    });
  });
});
