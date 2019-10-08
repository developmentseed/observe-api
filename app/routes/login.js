module.exports = [
  {
    path: '/login',
    method: ['GET', 'POST'],
    options: {
      auth: 'openstreetmap',
      handler: function (request, h) {
        return request.auth.credentials;
      }
    }
  }
];
