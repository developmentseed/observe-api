import db from '../services/db';
import { persistImageBase64, getAllMediaUrls } from '../services/media-store';
import { generateId } from './utils';
import cloneDeep from 'lodash.clonedeep';

/**
 * Default select fields for traces
 */
const defaultSelect = [
  'id',
  db.raw('ST_AsGeoJSON(location) as location'),
  'heading',
  'createdAt',
  'description',
  'osmElement',
  'ownerId',
  'uploadedAt',
  'users.osmDisplayName as ownerDisplayName'
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
    .select(defaultSelect)
    .join('users', 'users.osmId', '=', 'photos.ownerId');
}

/**
 * Get a single photo as JSON
 *
 * @param {integer} photo id
 *
 */
export async function getPhoto (id) {
  const photo = await select()
    .where('id', '=', id)
    .first();

  // Return formatted photo or null if not found
  return photo && photoToJson(photo);
}

/**
 * Create a photo, return populated with owner display name.
 *
 * @param {object} data properties to be added to photo
 *
 */
export async function createPhoto (data) {
  const id = generateId();
  const {
    createdAt,
    description,
    file,
    heading,
    lat,
    lon,
    osmElement,
    ownerId
  } = data;

  // Save media to file store
  await persistImageBase64(id, file, {
    lon,
    lat,
    heading,
    createdAt
  });

  // Insert photo
  await db('photos').insert({
    id,
    createdAt,
    description,
    heading,
    location: `POINT(${lon} ${lat})`,
    osmElement,
    ownerId
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
 * Helper function to build a where clause.
 */
function whereBuilder (builder, filterBy) {
  const {
    username,
    startDate,
    endDate,
    osmElementType,
    osmElementId
  } = filterBy;

  if (username) {
    builder.where('users.osmDisplayName', 'ilike', `%${username}%`);
  }

  if (startDate) {
    builder.where('createdAt', '>=', startDate);
  }

  if (endDate) {
    builder.where('createdAt', '<=', endDate);
  }

  if (osmElementType) {
    builder.where('osmElement', 'ilike', `%${osmElementType}%`);
  }

  if (osmElementId) {
    builder.where('osmElement', 'like', `%${osmElementId}%`);
  }
}

/**
 * Get total photo count.
 */
export async function countPhotos (filterBy = {}) {
  const countQuery = db('photos')
    .join('users', 'users.osmId', '=', 'photos.ownerId')
    .where(builder => whereBuilder(builder, filterBy))
    .count();
  return parseInt((await countQuery)[0].count);
}

/**
 * Get list of photos.
 *
 * @param {object} params pagination params
 */
export async function listPhotos ({ offset, limit, orderBy, filterBy }) {
  return db('photos')
    .select(defaultSelect)
    .join('users', 'users.osmId', '=', 'photos.ownerId')
    .where(builder => whereBuilder(builder, filterBy))
    .offset(offset)
    .orderBy(orderBy)
    .limit(limit)
    .map(photoToJson);
}
