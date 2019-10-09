module.exports = [
  {
    path: '/users',
    method: ['GET'],
    options: {
      auth: 'jwt',
      handler: function (request, h) {
        return { users: [] };
      }
    }
  }
];
