import db from '../services/db';
import { generateId } from './utils';

function get (id) {
  return db('traces').where('id', id);
}

function create (tracejson, ownerId) {
  const {
    geometry: { coordinates },
    properties: { timestamps, description }
  } = tracejson;

  // Transform GeoJSON feature to WKT
  const wkt = `LINESTRING (${coordinates.map(p => p.join(' ')).join(',')})`;

  return db('traces').insert({
    id: generateId(),
    ownerId,
    description,
    geometry: wkt,
    length: db.raw(`ST_Length(
      ST_GeogFromText('SRID=4326;${wkt}'),true)
    `),
    timestamps,
    recordedAt: new Date(timestamps[0])
  });
}

function asTraceJson (trace) {
  return {
    type: 'Feature',
    properties: {
      id: trace.id,
      ownerId: trace.ownerId,
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

function update (id, data) {
  return get(id).update(data);
}

function del (id) {
  return get(id).del();
}

function list ({ offset, limit, orderBy }) {
  return db('traces')
    .select([
      'id',
      'ownerId',
      'description',
      'length',
      'recordedAt',
      'uploadedAt',
      'updatedAt'
    ])
    .offset(offset)
    .orderBy(orderBy)
    .limit(limit)
    .map(r => {
      r.recordedAt = r.recordedAt.toISOString();
      r.uploadedAt = r.uploadedAt.toISOString();
      r.updatedAt = r.updatedAt.toISOString();
      return r;
    });
}

async function count () {
  return parseInt((await db('traces').count())[0].count);
}

export default {
  get,
  create,
  update,
  del,
  list,
  count,
  asTraceJson
};
