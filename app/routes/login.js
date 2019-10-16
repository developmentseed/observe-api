import Boom from '@hapi/boom';
import config from 'config';

const handler = function (request, h) {
  const { isAuthenticated, credentials } = request.auth;
  const redirectTo = credentials.query.redirect;
  if (!isAuthenticated) {
    return Boom.unauthorized('Could not authenticate at OpenStreetMap.');
  }

  // Redirect based on redirect query parameter
  if (redirectTo) { // FIXME: Check if redirect URL is part of allowed redirect URLs
    return h.redirect(
      `${redirectTo}?accessToken=${credentials.accessToken}`
    );
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
  },
  {
    path: '/login/mobile',
    method: ['GET', 'POST'],
    options: {
      auth: 'openstreetmap',
      handler
    }
  }
];
