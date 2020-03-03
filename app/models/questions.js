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

export async function getQuestion (id, version = 'latest') {
  const question = await db('questions')
    .select()
    .where('id', '=', id)
    .andWhere(builder => {
      if (version !== 'latest') {
        builder.where('version', version);
      } else {
        builder.max('version');
      }
    })
    .first();

  return question;
}

export async function getQuestionsLatest (ids) {
  const questions = await db('questions')
    .select('id', 'createdAt', 'label', 'type', 'options')
    .max('version').as('version')
    .whereIn('id', ids)
    .groupBy('id', 'createdAt', 'label', 'type', 'options')
    .limit(1);

  return questions;
}

export async function updateQuestion (data, version) {
  const {
    id,
    label,
    type,
    options
  } = data;

  const newVersion = version + 1;
  const response = await db('questions').insert({
    id: id,
    version: newVersion,
    label,
    type,
    options
  }, ['id']);

  return response;
}
