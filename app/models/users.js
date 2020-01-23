const db = require('../services/db');

export function get (osmId) {
  return db('users').where('osmId', osmId).first();
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

export function update (osmId, data) {
  return db('users')
    .update(data)
    .where('osmId', osmId)
    .returning('*');
}

export function list ({ offset, limit, orderBy, filterBy }) {
  return db('users')
    .select('osmId', 'osmDisplayName', 'osmCreatedAt', 'isAdmin')
    .count({ traces: 'traces.ownerId', photos: 'photos.ownerId' })
    .leftJoin('traces', 'users.osmId', '=', 'traces.ownerId')
    .leftJoin('photos', 'users.osmId', '=', 'photos.ownerId')
    .where(builder => whereBuilder(builder, filterBy))
    .groupBy('users.osmId')
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
    builder.where('users.osmDisplayName', 'ilike', `%${username}%`);
  }
}
