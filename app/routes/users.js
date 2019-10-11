import users from '../models/users';

module.exports = [
  {
    path: '/users',
    method: ['GET'],
    options: {
      auth: 'jwt',
      handler: async function (request, h) {
        const { limit, page, sort } = request.query;
        const offset = limit * (page - 1);
        let orderBy = ['osmDisplayName'];

        /**
         * This block parses the sort parameter and to the format used
         * by Knex: https://knexjs.org/#Builder-orderBy
         *
         * Example:
         *   - input: sort[osmDisplayName]=asc
         *   - output: { column: 'osmDisplayName', order: 'asc' }
         *
         */
        if (sort) {
          orderBy = Object.keys(sort).map(key => {
            return {
              column: key,
              order: sort[key]
            };
          });
        }

        const results = await users.list({
          offset,
          limit,
          orderBy
        });
        const count = await users.count();

        return h.paginate(results, count);
      }
    }
  }
];
