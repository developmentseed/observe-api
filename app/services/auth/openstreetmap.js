/** OSM strategy */
import config from 'config';
import { xml2js } from 'xml-js';
import logger from '../logger';
import { Client as CustomOauthClient } from './custom-client';
const appUrl = config.get('appUrl');

// Get OAuth settings
const {
  clientSecret,
  clientId,
  requestTokenUrl,
  accessTokenUrl,
  authorizeUrl,
  profileUrl
} = config.get('osmOAuth');

const oauthClient = new CustomOauthClient({
  name: 'osm',
  provider: {
    protocol: 'oauth',
    signatureMethod: 'HMAC-SHA1',
    temporary: requestTokenUrl,
    token: accessTokenUrl,
    auth: authorizeUrl
  },
  clientId,
  clientSecret,
  location: appUrl
});

// Define a strategy that can get and parse OSM profile XML
const osmStrategy = {
  protocol: 'oauth',
  temporary: requestTokenUrl,
  token: accessTokenUrl,
  auth: authorizeUrl,
  profile: async credentials => {
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

    credentials.profile = {
      osmId: profile.id,
      osmDisplayName: profile.display_name,
      osmCreatedAt: profile.account_created
    };

    return credentials;
  }
};

const serverStrategy = {
  provider: osmStrategy,
  password: 'cookie_encryption_password_secure',
  isSecure: false,
  clientSecret,
  clientId,
  location: appUrl
};

export default serverStrategy;
