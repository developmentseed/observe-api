import db from '../services/db';
import { persistImageBase64 } from '../services/media-store';
import { generateId } from './utils';

export async function createPhoto (data) {
  const id = generateId();
  const { file, ownerId, lon, lat, bearing, createdAt, osmObjects } = data;

  await persistImageBase64(id, file, {
    lon,
    lat,
    bearing,
    createdAt
  });

  return db('photos')
    .insert({
      id,
      ownerId,
      location: `POINT(${lon} ${lat})`,
      bearing,
      createdAt,
      osmObjects
    })
    .returning([
      'id',
      db.raw('ST_AsGeoJSON(location) as location'),
      'bearing',
      'ownerId',
      'createdAt',
      'uploadedAt',
      'osmObjects'
    ])
    .map(r => {
      // Parse GeoJSON
      r.location = JSON.parse(r.location);
      return r;
    });
}
    })
    .returning([
      'id',
      db.raw('ST_AsGeoJSON(location) as location'),
      'bearing',
      'ownerId',
      'createdAt',
      'uploadedAt'
    ])
    .map(r => {
      // Parse GeoJSON
      r.location = JSON.parse(r.location);
      return r;
    });
}
