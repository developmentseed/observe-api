import Boom from '@hapi/boom';
import config from 'config';
const allowedRedirectURLs = config.get('osmOAuth.allowedRedirectURLs').split(',');

const handler = function (request, h) {
  const { isAuthenticated, credentials } = request.auth;
  const redirectTo = credentials.query.redirect;
  if (!isAuthenticated) {
    return Boom.unauthorized('Could not authenticate at OpenStreetMap.');
  }

  // If `redirect` is passed
  if (redirectTo) {
    // Check if redirect URL is part of authorized list
    for (let i = 0; i < allowedRedirectURLs.length; i++) {
      const url = allowedRedirectURLs[i];
      if (redirectTo.indexOf(url) === 0) {
        return h.redirect(
          `${redirectTo}?accessToken=${credentials.accessToken}`
        );
      }
    }

    // Return error if invalid redirect URL.
    return Boom.badRequest('Invalid redirect URL.');
  } else {
    return {
      profile: credentials.profile,
      accessToken: credentials.accessToken
    };
  }
};

module.exports = [
  {
    path: '/login',
    method: ['GET', 'POST'],
    options: {
      auth: 'openstreetmap',
      handler
    }
  }
];
