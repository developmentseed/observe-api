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
 * Get all objects in database related to a user
 *
 * TODO This uses sequential blocking promises and might be improved with
 * Promise.all
 *
 * @param {int} id - id of user
 */
export async function getWithProfile (id) {
  let user = await db('users').select(
    ['id', 'displayName', db.raw('MD5(email) as gravatar'), 'osmCreatedAt', 'osmDisplayName', 'osmId', 'createdAt']
  ).where('id', id).first();

  if (!user) return null;

  user['surveys'] = await db('surveys').where('ownerId', id);
  user['observations'] = await db('observations').where('userId', id);
  user['photos'] = await db('photos').where('ownerId', id);
  user['traces'] = await db('traces').where('ownerId', id);

  // earned badges
  user['badges'] = await db('badges_users')
    .select('badgeId', 'userId', 'createdAt', 'name', 'description', 'image')
    .where('userId', id).leftJoin('badges', 'badges_users.badgeId', '=', 'badges.id');

  return user;
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
    .select('users.id', 'email', 'osmId', 'displayName', 'osmCreatedAt', 'osmDisplayName', 'users.createdAt', 'isAdmin')
    .count({ traces: 'traces.ownerId', photos: 'photos.ownerId', observations: 'observations.userId' })
    .leftJoin('traces', 'users.id', '=', 'traces.ownerId')
    .leftJoin('photos', 'users.id', '=', 'photos.ownerId')
    .innerJoin('observations', 'users.id', '=', 'observations.userId')
    .where(builder => whereBuilder(builder, filterBy))
    .groupBy('users.id')
    .offset(offset)
    .orderBy(orderBy)
    .limit(limit)
    .map(r => {
      r.createdAt = r.createdAt.toISOString();
      return r;
    });
}

/**
 * Helper function to build a where clause.
 */
function whereBuilder (builder, filterBy) {
  const {
    username,
    campaignId
  } = filterBy;

  if (username) {
    builder.where('users.displayName', 'ilike', `%${username}%`);
  }
  if (campaignId) {
    builder.where('observations.campaignId', '=', campaignId);
  }
}
