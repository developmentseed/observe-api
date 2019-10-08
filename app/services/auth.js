import config from 'config';
import Bell from '@hapi/bell';
import { xml2js } from 'xml-js';
import logger from './logger';
import users from '../models/users';

// Get OAuth settings
const {
  clientSecret,
  clientId,
  requestTokenUrl,
  accessTokenUrl,
  authorizeUrl,
  profileUrl
} = config.get('osmOAuth');

/**
 * Setup OAuth provider for hapi-bell.
 *
 * @param {object} server
 */
async function setupAuth (server) {
  // Add a simulated provided for testing
  if (process.env.NODE_ENV === 'test') {
    Bell.simulate(() => {
      return { some: 'value' };
    });
  }

  // Register Bell
  await server.register(Bell);

  // Client to get profile as raw XML
  const oauthClient = new Bell.oauth.Client({
    name: 'osm',
    provider: {
      protocol: 'oauth',
      signatureMethod: 'HMAC-SHA1',
      temporary: requestTokenUrl,
      token: accessTokenUrl,
      auth: authorizeUrl
    },
    clientId,
    clientSecret
  });

  const osmStrategy = {
    protocol: 'oauth',
    temporary: requestTokenUrl,
    token: accessTokenUrl,
    auth: authorizeUrl,
    profile: async (credentials, params, get) => {
      let profile;

      // Get and parse user profile XML
      try {
        const { payload } = await oauthClient.resource(
          'GET',
          profileUrl,
          null,
          {
            token: credentials.token,
            secret: credentials.secret,
            raw: true
          }
        );
        profile = xml2js(payload).elements[0].elements[0].attributes;
        profile.id = parseInt(profile.id);
      } catch (error) {
        logger.error(error);
        throw Error('Could not get user profile from OpenStreetMap.');
      }

      // Retrieve user from database
      const [user] = await users.findByOsmId(profile.id);

      // Upsert user
      if (!user) {
        // Create new user, if none found
        await users.create({
          osmId: profile.id,
          osmDisplayName: profile.display_name,
          osmCreatedAt: profile.account_created
        });
      } else {
        // Update display name of existing user, if it has changed in OSM.
        if (user.osmDisplayName !== profile.display_name) {
          await users.updateFromOsmId(profile.id, {
            osmDisplayName: profile.display_name
          });
        }
      }
    }
  };

  // Add custom OSM strategy
  server.auth.strategy('openstreetmap', 'bell', {
    provider: osmStrategy,
    password: 'cookie_encryption_password_secure',
    isSecure: false,
    clientSecret,
    clientId
  });
}

export default setupAuth;
