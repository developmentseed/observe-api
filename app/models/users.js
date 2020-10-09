const db = require('../services/db');

export function get (id) {
  return db('users').where('id', id).first();
}

export function getByOsmId (osmId) {
  return db('users').where('osmId', osmId).first();
}

export function getByEmail (email) {
  return db('users').where('email', email).first();
}

/**
 * Get total users count.
 */
export async function count (filterBy = {}) {
  const countQuery = db('users')
    .where(builder => whereBuilder(builder, filterBy))
    .count();
  return parseInt((await countQuery)[0].count);
}

export function create (data) {
  return db('users').insert({ ...data });
}

export function update (userId, data) {
  return db('users')
    .update(data)
    .where('id', userId)
    .returning('*');
}

export function list ({ offset, limit, orderBy, filterBy = {} }) {
  return db('users')
    .select('id', 'email', 'osmId', 'displayName', 'osmDisplayName', 'osmCreatedAt', 'created_at', 'isAdmin')
    .count({ traces: 'traces.ownerId', photos: 'photos.ownerId', observations: 'observations.userId' })
    .leftJoin('traces', 'users.id', '=', 'traces.ownerId')
    .leftJoin('photos', 'users.id', '=', 'photos.ownerId')
    .leftJoin('observations', 'users.id', '=', 'observations.userId')
    .where(builder => whereBuilder(builder, filterBy))
    .groupBy('users.id')
    .offset(offset)
    .orderBy(orderBy)
    .limit(limit)
    .map(r => {
      r.osmCreatedAt = r.osmCreatedAt.toISOString();
      return r;
    });
}

/**
 * Helper function to build a where clause.
 */
function whereBuilder (builder, filterBy) {
  const {
    username
  } = filterBy;

  if (username) {
    builder.where('users.displayName', 'ilike', `%${username}%`);
  }
}
