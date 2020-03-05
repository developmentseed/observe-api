import db from '../services/db';

export async function createAnswer (data, trx) {
  const {
    observationId,
    questionId,
    questionVersion,
    answer
  } = data;

  const id = await db('answers')
    .insert({
      observationId,
      questionId,
      questionVersion,
      answer
    })
    .transacting(trx);

  return id;
}
