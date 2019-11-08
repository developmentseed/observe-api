import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import db from '../../services/db';
import logger from '../../services/logger';
import traces from '../../models/traces';

/**
 * @apiGroup Traces
 *
 * @api {post} /traces 1. POST /traces
 *
 * @apiDescription Upload a new trace.
 *
 * @apiParam {object} tracejson TraceJSON object.
 *
 * @apiUse AuthorizationHeader
 * @apiUse Success200TraceJSON
 * @apiUse Error4xx
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
              description: Joi.string().empty(''),
              timestamps: Joi.array()
                .min(2)
                .items(Joi.number())
            }).required(),
            geometry: Joi.object({
              type: Joi.valid('LineString'),
              coordinates: Joi.array()
                .min(2)
                .items(
                  Joi.array().ordered(
                    Joi.number()
                      .min(-180)
                      .max(180)
                      .required(),
                    Joi.number()
                      .min(-90)
                      .max(90)
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
