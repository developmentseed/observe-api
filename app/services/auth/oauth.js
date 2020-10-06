import Bell from '@hapi/bell';
import osmStrategy from './openstreetmap';
import googleStrategy from './google';
import { getAccessTokenFromUserId } from './jwt';

/**
 * Setup OAuth provider for hapi-bell.
 *
 * @param {object} server
 */
async function setupOAuth (server) {
  // Add a simulated provider for testing
  if (process.env.NODE_ENV === 'test') {
    Bell.simulate(async req => {
      const { userId } = req.query;

      const accessToken = await getAccessTokenFromUserId(parseInt(userId));

      return { accessToken };
    });
  }

  // Register Bell
  await server.register(Bell);

  server.auth.strategy('openstreetmap', 'bell', osmStrategy);
  server.auth.strategy('google', 'bell', googleStrategy);
}

export default setupOAuth;
