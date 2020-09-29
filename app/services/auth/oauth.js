import Bell from '@hapi/bell';
import osmStrategy from './openstreetmap';
import { getAccessTokenFromOsmId } from './jwt';

/**
 * Setup OAuth provider for hapi-bell.
 *
 * @param {object} server
 */
async function setupOAuth (server) {
  // Add a simulated provider for testing
  if (process.env.NODE_ENV === 'test') {
    Bell.simulate(async req => {
      const { osmId } = req.query;

      const accessToken = await getAccessTokenFromOsmId(parseInt(osmId));

      return { accessToken };
    });
  }

  // Register Bell
  await server.register(Bell);

  server.auth.strategy('openstreetmap', 'bell', osmStrategy);
}

export default setupOAuth;
