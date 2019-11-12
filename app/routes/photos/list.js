import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import { countPhotos, listPhotos } from '../../models/photos';
import logger from '../../services/logger';

/**
 * @apiGroup Photos
 *
 * @api {get} /photos 5. GET /photos
 * @apiDescription List photos.
 *
 * @apiUse AuthorizationHeader
 *
 * @apiUse PaginationParams
 *
 * @apiSuccess {object} meta Pagination metadata.
 * @apiSuccess {object} results List of photos.
 * @apiSuccessExample {json} Success response:
 * { meta:
 *  { count: 15,
 *    pageCount: 5,
 *    totalCount: 50,
 *    next: 'http://0.0.0.0:3001/photos?page=4&sort=&limit=15',
 *    previous: 'http://0.0.0.0:3001/photos?page=2&sort=&limit=15',
 *    self: 'http://0.0.0.0:3001/photos?page=3&sort=&limit=15',
 *    first: 'http://0.0.0.0:3001/photos?page=1&sort=&limit=15',
 *    last: 'http://0.0.0.0:3001/photos?page=4&sort=&limit=15' },
 *  results:
 *    [ { id: '_OeLSdc-nf',
 *        ownerId: 87122,
 *        ownerDisplayName: 'User22',
 *        description: 'Photo description.',
 *        uploadedAt: '2019-10-16T10:44:16.321Z',
 *        createdAt: '2019-10-16T10:44:16.321Z' },
 *      { id: '2kWAlmk_Ev',
 *        ownerId: 87123,
 *        ownerDisplayName: 'User23',
 *        description: 'Photo description.',
 *        uploadedAt: '2019-10-16T10:44:16.326Z',
 *        createdAt: '2019-10-16T10:44:16.326Z' },
 *      { id: '9jF9mT4llR',
 *        ownerId: 87124,
 *        ownerDisplayName: 'User24',
 *        description: 'Photo description.',
 *        uploadedAt: '2019-10-16T10:44:16.330Z',
 *        createdAt: '2019-10-16T10:44:16.330Z' },
 *      { id: '0qGqe-jZ5a',
 *        ownerId: 87125,
 *        ownerDisplayName: 'User25',
 *        description: 'Photo description.',
 *        uploadedAt: '2019-10-16T10:44:16.334Z',
 *        createdAt: '2019-10-16T10:44:16.334Z' },
 *      { id: 'O1HDf5mOhQ',
 *        ownerId: 87126,
 *        ownerDisplayName: 'User26',
 *        description: 'Photo description.',
 *        uploadedAt: '2019-10-16T10:44:16.339Z',
 *        createdAt: '2019-10-16T10:44:16.339Z' },
 *  ]}
 * }
 *
 * @apiUse Error4xx
 */
export default [
  {
    path: '/photos',
    method: ['GET'],
    options: {
      auth: 'jwt',
      validate: {
        query: Joi.object({
          limit: Joi.number()
            .integer()
            .min(1)
            .max(100),
          page: Joi.number()
            .integer()
            .min(1),
          sort: Joi.object({
            description: Joi.string().valid('asc', 'desc'),
            uploadedAt: Joi.string().valid('asc', 'desc'),
            createdAt: Joi.string().valid('asc', 'desc')
          })
        })
      }
    },
    handler: async function (request, h) {
      try {
        // Get query params
        const { limit, page, sort } = request.query;
        const offset = limit * (page - 1);
        let orderBy = [{ column: 'uploadedAt', order: 'desc' }];

        /**
         * Parses the sort parameter to format used by Knex:
         *   - https://knexjs.org/#Builder-orderBy
         *
         * Example:
         *   - input: sort[uploadedAt]=asc
         *   - output: { column: 'uploadedAt', order: 'asc' }
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

        const results = await listPhotos({
          offset,
          limit,
          orderBy
        });

        const count = await countPhotos();

        return h.paginate(results, count);
      } catch (error) {
        logger.error(error);
        return Boom.badImplementation('Unexpected error.');
      }
    }
  }
];
