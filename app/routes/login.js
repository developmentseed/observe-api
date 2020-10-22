import Boom from '@hapi/boom';
import config from 'config';
import * as users from '../models/users';
import { getAccessTokenFromUserId } from '../services/auth/jwt';
const allowedRedirectURLs = config.get('osmOAuth.allowedRedirectURLs').split(',');

const handler = async function (request, h) {
  const { isAuthenticated, credentials } = request.auth;
  const redirectTo = credentials.query.redirect;
  if (!isAuthenticated) {
    return Boom.unauthorized('Could not authenticate.');
  }

  // User is authenticated, we add the user to the database
  // Retrieve user from database
  let profile = credentials.profile;
  let user;
  if (profile.osmId) {
    // OSM Login
    user = await users.getByOsmId(profile.osmId);

    if (!user) {
      user = await users
        .create({
          osmId: profile.osmId,
          displayName: profile.osmDisplayName,
          osmDisplayName: profile.osmDisplayName,
          osmCreatedAt: profile.account_created
        })
        .returning('*');

      user = user[0];
    }
  } else if (profile.email) {
    // Other social login like Google
    user = await users.getByEmail(profile.email);

    if (!user) {
      user = await users
        .create({
          displayName: profile.displayName,
          email: profile.email
        })
        .returning('*');

      user = user[0];
    }
  } else {
    return Boom.badImplementation('Could not complete authentication flow.');
  }

  credentials.profile.isAdmin = user.isAdmin;

  let accessToken = await getAccessTokenFromUserId(user.id);

  // If `redirect` is passed
  if (redirectTo) {
    // Check if redirect URL is part of authorized list
    for (let i = 0; i < allowedRedirectURLs.length; i++) {
      const url = allowedRedirectURLs[i];
      if (redirectTo.indexOf(url) === 0) {
        return h.redirect(
          `${redirectTo}?accessToken=${accessToken}`
        );
      }
    }

    // Return error if invalid redirect URL.
    return Boom.badRequest('Invalid redirect URL.');
  } else {
    return {
      profile: credentials.profile,
      accessToken: accessToken
    };
  }
};

// Add the idp handlers
let idpRoutes = ['openstreetmap', 'google'].map(idp => ({
  path: `/login/${idp}`,
  method: ['GET', 'POST'],
  options: {
    auth: idp,
    handler
  }
}));

module.exports = [
  {
    path: '/login',
    method: ['GET', 'POST'],
    options: {
      auth: 'openstreetmap', // default to OSM for backwards compatibility
      handler
    }
  }
]
  .concat(idpRoutes)
;
