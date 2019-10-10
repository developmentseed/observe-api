import config from 'config';
import orderBy from 'lodash.orderby';
import db from '../app/services/db';
import { expect } from 'chai';
import { createMockUser, Client } from './utils';
const paginationLimit = config.get('pagination.limit');

/* global apiUrl */

describe('User management', function () {
  describe('GET /users', function () {
    it('should return 400 for non-authenticated user', async function () {
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

    it('should return 200 for an authenticated user', async function () {
      const { osmId } = await createMockUser();
      const client = new Client(apiUrl);
      await client.login(osmId);
      const { status } = await client.get('/users');
      expect(status).to.equal(200);
    });

    it('default query should order by display name and limit results', async function () {
      const users = [];

      await db('users').delete();

      // Create 5 admins
      for (let i = 0; i < 5; i++) {
        users.push(await createMockUser({ isAdmin: true }));
      }

      // Create a HTTP client with an admin authenticated
      const { osmId } = users[0];
      const client = new Client(apiUrl);
      client.login(osmId);

      // Create more 45 users
      for (let i = 0; i < 45; i++) {
        users.push(await createMockUser());
      }

      // Parse date to string for easy comparison
      users.map(r => {
        r.osmCreatedAt = r.osmCreatedAt.toISOString();
        return r;
      });

      // Prepare expected response for default query
      let expectedResponse1 = orderBy(users, 'osmDisplayName').slice(
        0,
        paginationLimit
      );

      // Default query, should be order by display name and match limit
      const res1 = await client.get('/users');
      expect(res1.data.meta.totalCount).to.eq(50);
      expect(res1.data.results).to.deep.equal(expectedResponse1);

      // Prepare expected response for page 3, ordering by creation date
      const page = 3;
      const offset = paginationLimit * (page - 1);
      const expectedResponse2 = orderBy(users, 'osmCreatedAt').slice(
        offset,
        offset + paginationLimit
      );

      const res2 = await client.get('/users', {
        params: {
          page,
          orderBy: 'osmCreatedAt'
        }
      });
      expect(res2.data.meta.totalCount).to.eq(50);
      expect(res2.data.results).to.deep.equal(expectedResponse2);
    });

  });
});
