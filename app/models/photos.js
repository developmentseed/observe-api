import db from '../services/db';
import { persistImageBase64, getAllMediaUrls } from '../services/media-store';
import { generateId } from './utils';
import cloneDeep from 'lodash.clonedeep';

// Utility function for JSON responses
export function photoToJson (originalPhoto) {
  const photo = cloneDeep(originalPhoto);

  // Populate media URLs
  photo.urls = getAllMediaUrls(photo.id);

  // Parse GeoJSON if string
  if (typeof photo.location === 'string') {
    photo.location = JSON.parse(photo.location);
  }
  return photo;
}

export function getPhoto (id, select) {
  return db('photos')
    .select(select)
    .where('id', id);
}

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

export async function updatePhoto (id, data) {
  return getPhoto(id)
    .update(data)
    .returning([
      'id',
      db.raw('ST_AsGeoJSON(location) as location'),
      'bearing',
      'ownerId',
      'createdAt',
      'uploadedAt',
      'osmObjects'
    ]);
}
