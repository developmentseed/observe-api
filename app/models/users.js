const uuidv4 = require('uuid/v4');
const db = require('../services/db');

function findByOsmId (osmId) {
  return db('users').where('osmId', osmId);
}

function create (data) {
  return db('users').insert({ ...data, id: uuidv4() });
}

function updateFromOsmId (osmId, data) {
  return findByOsmId(osmId)
    .update(data)
    .returning('*');
}

module.exports = {
  findByOsmId,
  create,
  updateFromOsmId
};
