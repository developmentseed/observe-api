import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import db from '../../services/db';
import logger from '../../services/logger';
import traces from '../../models/traces';

/**
 * @api {post} /traces POST
 * @apiGroup traces
 * @apiDescription Upload a trace.
 *
 * @apiParam {object} [tracejson] TraceJSON object.
 *
 * @apiSuccess {object}   tracejson       TraceJSON object, with properties populated with id, timestamps and description.
 *
 * @apiError statusCode     The error code
 * @apiError error          Error name
 * @apiError message        Error message
 * @apiErrorExample {json} Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *      "statusCode": 400,
 *      "error": "Bad Request",
 *      "message": "Oops!"
 *     }
 */
export default [
  {
    path: '/traces',
    method: ['POST'],
    options: {
      auth: 'jwt',
      validate: {
        payload: Joi.object({
          tracejson: Joi.object({
            type: Joi.valid('Feature'),
            properties: Joi.object({
              description: Joi.string(),
              timestamps: Joi.array()
                .min(1)
                .items(Joi.number())
            }).required(),
            geometry: Joi.object({
              type: Joi.valid('LineString'),
              coordinates: Joi.array()
                .min(1)
                .items(
                  Joi.array().ordered(
                    Joi.number()
                      .min(-90)
                      .max(90)
                      .required(),
                    Joi.number()
                      .min(-180)
                      .max(180)
                      .required()
                  )
                )
            }).required()
          })
            .custom(value => {
              // Check if number of timestamps matches number of points in trace.
              const {
                properties: { timestamps },
                geometry: { coordinates }
              } = value;
              if (timestamps.length !== coordinates.length) {
                throw new Error(
                  'number of timestamps and points does not match.'
                );
              }
              return value;
            })
            .required()
        })
      },
      handler: async function (request) {
        try {
          // Get user id
          const {
            credentials: { osmId }
          } = request.auth;

          // Get properties from TraceJson
          const { tracejson } = request.payload;

          // Insert trace
          const [trace] = await traces
            .create(tracejson, osmId)
            .returning([
              'id',
              'ownerId',
              'description',
              'length',
              'recordedAt',
              'uploadedAt',
              'updatedAt',
              'timestamps',
              db.raw('ST_AsGeoJSON(geometry) as geometry')
            ]);

          // Return as TraceJSON
          return traces.asTraceJson(trace);
        } catch (error) {
          logger.error(error);
          return Boom.badImplementation('Unexpected error.');
        }
      }
    }
  }
];
