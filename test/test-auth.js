import config from 'config';
import db from '../app/services/db';
import { expect } from 'chai';
import { createMockUser } from './utils/mock-factory';
import Client from './utils/http-client';
import { delay } from '../app/utils';
import JWT from 'jsonwebtoken';

const secret = config.get('jwt.secret');

describe('Authorization', function () {
  before(async function () {
    // Clear existing users
    await db('users').delete();
  });

  describe('token duration', function () {
    it('should forbid access when token is expired', async function () {
      try {
        const client = new Client();
        const regularUser = await createMockUser();

        // First make a request with a non-expired token
        const token1 = JWT.sign(regularUser, secret, {
          expiresIn: '1s'
        });
        client.setAuthorizationHeader(token1);
        await client.get('/users');

        // Then make a request with a expired token
        const token2 = JWT.sign(regularUser, secret, {
          expiresIn: '1s'
        });
        client.setAuthorizationHeader(token2);
        await delay(2000); // wait 2 s
        await client.get('/users');

        // The test should never reach here, force execute catch block.
        throw Error('An error was expected.');
      } catch (error) {
        // Check for the appropriate status response
        expect(error.response.status).to.equal(401);
      }
    });
    it('should refresh token near expiration date');
  });

  describe('update user admin status', function () {
    it('should return refresh token when admin status is promoted');
    it('should return refresh token when admin status is demoted');
  });
});
