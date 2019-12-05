const db = require('../services/db');

function findByOsmId (osmId) {
  return db('users').where('osmId', osmId);
}

async function count () {
  return parseInt((await db('users').count())[0].count);
}

function create (data) {
  return db('users').insert({ ...data });
}

function updateFromOsmId (osmId, data) {
  return findByOsmId(osmId)
    .update(data)
    .returning('*');
}

function list ({ offset, limit, orderBy }) {
  return db('users')
    .select('osmId', 'osmDisplayName', 'osmCreatedAt', 'isAdmin')
    .count({ traces: 'traces.ownerId', photos: 'photos.ownerId' })
    .leftJoin('traces', 'users.osmId', '=', 'traces.ownerId')
    .leftJoin('photos', 'users.osmId', '=', 'photos.ownerId')
    .groupBy('users.osmId')
    .offset(offset)
    .orderBy(orderBy)
    .limit(limit)
    .map(r => {
      r.osmCreatedAt = r.osmCreatedAt.toISOString();
      return r;
    });
}

module.exports = {
  create,
  count,
  findByOsmId,
  list,
  updateFromOsmId
};
