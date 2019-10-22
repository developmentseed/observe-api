import db from '../services/db';
import { persistImageBase64, getAllMediaUrls } from '../services/media-store';
import { generateId } from './utils';
import cloneDeep from 'lodash.clonedeep';

const defaultSelect = [
  'id',
  db.raw('ST_AsGeoJSON(location) as location'),
  'bearing',
  'createdAt',
  'description',
  'osmObjects',
  'ownerId',
  'uploadedAt'
];

// Utility function for JSON responses
export function photoToJson (originalPhoto) {
  const photo = cloneDeep(originalPhoto);

  // Populate media URLs
  photo.urls = getAllMediaUrls(photo.id);

  // Parse GeoJSON if string
  if (typeof photo.location === 'string') {
    photo.location = JSON.parse(photo.location);
  }

  // Dates to string
  photo.createdAt = photo.createdAt.toISOString();
  photo.uploadedAt = photo.uploadedAt.toISOString();

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
    .returning(defaultSelect)
    .map(photoToJson);
}

export async function updatePhoto (id, data) {
  return getPhoto(id)
    .update(data)
    .returning(defaultSelect);
}

export async function deletePhoto (id) {
  return getPhoto(id).del();
}

export async function countPhotos () {
  return parseInt((await db('photos').count())[0].count);
}

export async function listPhotos ({ offset, limit, orderBy }) {
  return db('photos')
    .select(defaultSelect)
    .offset(offset)
    .orderBy(orderBy)
    .limit(limit)
    .map(photoToJson);
}
