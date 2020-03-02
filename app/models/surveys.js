import db from '../services/db';

export async function createSurvey (data) {
  const {
    name,
    ownerId,
    questions
  } = data;

  const id = await db('surveys').insert({
    name,
    ownerId,
    questions
  }, 'id');

  return id;
}

export async function getSurvey (id) {
  const survey = await db('surveys').select()
    .where('id', '=', id)
    .first();

  return survey;
}
