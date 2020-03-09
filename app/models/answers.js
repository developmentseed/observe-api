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

export async function getAnswers (observationId) {
  const answers = await db('answers')
    .select()
    .where('observationId', observationId);

  return answers;
}

export async function getAnswerSummary (observationIds, questionId) {
  const positiveAnswerCount = await db('answers')
    .count()
    .whereIn('observationId', observationIds)
    .andWhere('questionId', questionId)
    .andWhereRaw("answer->>'yes'=?", ['Yes']);

  const totalCount = await db('answers')
    .count()
    .whereIn('observationId', observationIds)
    .andWhere('questionId', questionId);

  const negativeAnswerCount = totalCount[0].count - positiveAnswerCount[0].count;
  const summary = {
    'total': totalCount[0].count,
    'yes': positiveAnswerCount[0].count,
    'no': negativeAnswerCount
  };

  return summary;
}
