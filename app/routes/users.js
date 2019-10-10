import users from '../models/users';

module.exports = [
  {
    path: '/users',
    method: ['GET'],
    options: {
      auth: 'jwt',
      handler: async function (request, h) {
        const { limit, page, orderBy } = request.query;
        const offset = limit * (page - 1);
        const defaultOrderBy = ['osmDisplayName'];

        const results = await users.list({
          offset,
          limit,
          orderBy: orderBy || defaultOrderBy
        });
        const count = await users.count();

        return h.paginate(results, count);
      }
    }
  }
];
