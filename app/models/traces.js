import db from '../services/db';
import shortid from 'shortid';

function create (data) {
  return db('traces').insert({ ...data, id: shortid.generate() });
}

export default {
  create
};
