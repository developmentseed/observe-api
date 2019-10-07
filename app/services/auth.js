import config from 'config';
import Bell from '@hapi/bell';
import { xml2js } from 'xml-js';
import request from 'request-promise-native';
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

// Create OAuth instance to fetch OSM user profile. See:
// - https://github.com/hapijs/bell/issues/440
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const oauth = OAuth({
  consumer: { key: clientId, secret: clientSecret },
  signature_method: 'HMAC-SHA1',
  hash_function (baseString, key) {
    return crypto
      .createHmac('sha1', key)
      .update(baseString)
      .digest('base64');
  }
});

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

  const osmStrategy = {
    protocol: 'oauth',
    temporary: requestTokenUrl,
    token: accessTokenUrl,
    auth: authorizeUrl,
    profile: async (credentials, params, get) => {
      let profileXml, profile;

      // Get user profile from OpenStreetMap
      try {
        const requestData = {
          url: profileUrl,
          method: 'GET'
        };

        const token = {
          key: credentials.token,
          secret: credentials.secret
        };

        profileXml = await request({
          uri: profileUrl,
          headers: oauth.toHeader(oauth.authorize(requestData, token))
        });
      } catch {
        throw Error('Could not get user profile from OpenStreetMap.');
      }

      // Parse user profile XML
      try {
        profile = xml2js(profileXml).elements[0].elements[0].attributes;
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
