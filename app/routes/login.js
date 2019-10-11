import Boom from '@hapi/boom';
import config from 'config';
const mobileCallbackUrl = config.get('osmOAuth.mobileCallbackUrl');

const handler = function (request, h) {
  const { isAuthenticated, credentials } = request.auth;

  if (!isAuthenticated) {
    return Boom.unauthorized('Could not authenticate at OpenStreetMap.');
  }

  // Redirect based on the route
  if (request.url.pathname === '/login/mobile') {
    return h.redirect(
      `${mobileCallbackUrl}?#accessToken=${credentials.accessToken}`
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
