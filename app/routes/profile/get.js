/**
 * @apiGroup Users
 *
 * @api {get} /profile  2. GET /profile
 * @apiDescription Get profile for the authenticated user.
  *
 * @apiUse AuthorizationHeader
 *
 * @apiUse Error4xx
 */
module.exports = [
  {
    path: '/profile',
    method: ['GET'],
    options: {
      auth: 'jwt'
    },
    handler: async function (request) {
      return request.auth.credentials;
    }
  }
];
