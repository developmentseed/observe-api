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

/**
 * Select query that includes owner display name
 */
export function select () {
  return db('photos')
    .select(defaultSelect.concat(['users.osmDisplayName as ownerDisplayName']))
    .join('users', 'users.osmId', '=', 'photos.ownerId');
}

/**
 * Get a single photo as JSON
 *
 * @param {integer} photo id
 *
 */
export function getPhoto (id) {
  return select()
    .where('id', id)
    .map(photoToJson);
}

/**
 * Create a photo, return populated with owner display name.
 *
 * @param {object} data properties to be added to photo
 *
 */
export async function createPhoto (data) {
  const id = generateId();
  const { file, ownerId, lon, lat, bearing, createdAt, osmObjects } = data;

  // Save media to file store
  await persistImageBase64(id, file, {
    lon,
    lat,
    bearing,
    createdAt
  });

  // Insert photo
  await db('photos').insert({
    id,
    ownerId,
    location: `POINT(${lon} ${lat})`,
    bearing,
    createdAt,
    osmObjects
  });

  // Load inserted photo
  return getPhoto(id);
}

/**
 * Update a photo, return populated with owner display name.
 *
 * @param {integer} id photo id
 * @param {object} data properties to updated
 *
 */
export async function updatePhoto (id, data) {
  // Update record
  await db('photos')
    .where('id', '=', id)
    .update(data);

  // Return a fully loaded object
  return getPhoto(id);
}

/**
 * Delete a photo.
 *
 * @param {integer} id photo id
 */
export async function deletePhoto (id) {
  return db('photos')
    .delete()
    .where('id', id);
}

/**
 * Get total photo count.
 */
export async function countPhotos () {
  return parseInt((await db('photos').count())[0].count);
}

/**
 * Get list of photos.
 *
 * @param {object} params pagination params
 */
export async function listPhotos ({ offset, limit, orderBy }) {
  return select()
    .offset(offset)
    .orderBy(orderBy)
    .limit(limit)
    .map(photoToJson);
}
