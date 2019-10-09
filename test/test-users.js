import { expect } from 'chai';
import { createMockUser, Client } from './utils';

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
  });
});
