import db from '../services/db';
import { generateId } from './utils';

/**
 * Default select fields for traces
 */
const defaultSelect = [
  'id',
  'ownerId',
  'description',
  'length',
  'recordedAt',
  'uploadedAt',
  'updatedAt',
  'users.osmDisplayName as ownerDisplayName'
];

/**
 * Parse trace timestamps into strings
 */
const formatTimestamps = trace => {
  trace.recordedAt = trace.recordedAt.toISOString();
  trace.uploadedAt = trace.uploadedAt.toISOString();
  trace.updatedAt = trace.updatedAt.toISOString();
  return trace;
};

/**
 * Get trace
 *
 * @param {integer} trace id
 *
 */
export async function getTrace (id) {
  const trace = await db('traces')
    .select(defaultSelect)
    .join('users', 'users.osmId', '=', 'traces.ownerId')
    .where('id', id)
    .first();

  // Return formatted trace or null if not found
  return trace && formatTimestamps(trace);
}

/**
 * Get TraceJSON
 *
 * @param {integer} trace id
 *
 */
export async function getTraceJson (id) {
  const trace = await db('traces')
    .select(
      defaultSelect.concat([
        db.raw('ST_AsGeoJSON(geometry) as geometry'),
        'timestamps'
      ])
    )
    .join('users', 'users.osmId', '=', 'traces.ownerId')
    .where('id', '=', id)
    .first();

  // Return formatted trace or null if not found
  return trace && asTraceJson(trace);
}

/**
 * Create a trace, return populated with owner display name.
 *
 * @param {object} tracejson TraceJSON object
 * @param {integer} ownerId Owner id
 *
 */
export async function createTrace (tracejson, ownerId) {
  const id = generateId();

  const {
    geometry: { coordinates },
    properties: { timestamps, description }
  } = tracejson;

  // Transform GeoJSON feature to WKT
  const wkt = `LINESTRING (${coordinates.map(p => p.join(' ')).join(',')})`;

  await db('traces')
    .insert({
      id,
      ownerId,
      description,
      geometry: wkt,
      length: db.raw(`ST_Length(
      ST_GeogFromText('SRID=4326;${wkt}'),true)
    `),
      timestamps,
      recordedAt: new Date(timestamps[0])
    })
    .returning('id');

  return getTraceJson(id);
}

/**
 * Update a trace, return populated with owner display name.
 *
 * @param {integer} id trace id
 * @param {object} data properties to updated
 *
 */
export async function updateTrace (id, data) {
  // Update record
  await db('traces')
    .where('id', '=', id)
    .update({
      ...data,
      updatedAt: new Date()
    });

  return getTrace(id);
}

/**
 * Delete a trace.
 *
 * @param {integer} id trace id
 */
export function deleteTrace (id) {
  return db('traces')
    .delete()
    .where('id', id);
}

/**
 * Get list of traces.
 *
 * @param {object} params pagination params
 */
export function listTraces ({ offset, limit, orderBy, filterBy = {} }) {
  return db('traces')
    .select(defaultSelect)
    .join('users', 'users.osmId', '=', 'traces.ownerId')
    .where(builder => whereBuilder(builder, filterBy))
    .offset(offset)
    .orderBy(orderBy)
    .limit(limit)
    .map(formatTimestamps);
}

/**
 * Get total trace count.
 */
export async function getTracesCount (filterBy = {}) {
  const countQuery = db('traces')
    .join('users', 'users.osmId', '=', 'traces.ownerId')
    .where(builder => whereBuilder(builder, filterBy))
    .count();
  return parseInt((await countQuery)[0].count);
}

/**
 * Helper function to build a where clause.
 */
function whereBuilder (builder, filterBy) {
  const { username, startDate, endDate, lengthMin, lengthMax } = filterBy;

  if (username) {
    builder.where('users.osmDisplayName', 'ilike', `%${username}%`);
  }

  if (startDate) {
    builder.where('recordedAt', '>=', startDate);
  }

  if (endDate) {
    builder.where('recordedAt', '<=', `${endDate}T23:59:59.999Z`);
  }

  if (lengthMin) {
    builder.where('length', '>=', lengthMin);
  }

  if (lengthMax) {
    builder.where('length', '<=', lengthMax);
  }
}

/**
 * Format trace as TraceJSON
 *
 * @param {trace} object trace properties
 */
export function asTraceJson (trace) {
  return {
    type: 'Feature',
    properties: {
      id: trace.id,
      ownerId: trace.ownerId,
      ownerDisplayName: trace.ownerDisplayName,
      description: trace.description,
      length: trace.length,
      recordedAt: trace.recordedAt,
      uploadedAt: trace.uploadedAt,
      updatedAt: trace.updatedAt,
      timestamps: trace.timestamps
    },
    geometry: JSON.parse(trace.geometry)
  };
}
