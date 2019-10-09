import Boom from '@hapi/boom';

module.exports = [
  {
    path: '/login',
    method: ['GET', 'POST'],
    options: {
      auth: 'openstreetmap',
      handler: function (request) {
        const { isAuthenticated, credentials } = request.auth;

        if (!isAuthenticated) {
          return Boom.unauthorized('Could not authenticate at OpenStreetMap.');
        }

        return {
          profile: credentials.profile,
          accessToken: credentials.accessToken
        };
      }
    }
  }
];
