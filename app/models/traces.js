import db from '../services/db';
import shortid from 'shortid';

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
    id: shortid.generate(),
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

export default {
  get,
  create,
  update,
  asTraceJson
};
