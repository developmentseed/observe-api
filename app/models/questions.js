import db from '../services/db';

export async function createQuestion (data) {
  const {
    version,
    label,
    type,
    options
  } = data;

  const id = await db('questions').insert({
    version,
    label,
    type,
    options
  }, ['id']);

  return getQuestion(id[0].id, version);
}

export async function getQuestion (id, version) {
  const question = await db('questions')
    .select()
    .where('id', '=', id)
    .andWhere('version', '=', version)
    .first();

  return question;
}
