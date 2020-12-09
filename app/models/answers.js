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
  const answerCounts = await db('answers')
    .select(db.raw("count (id), jsonb_array_elements((answer->>'answer')::jsonb) as response"))
    .whereIn('observationId', observationIds)
    .andWhere('questionId', questionId)
    .groupBy('response');

  const summary = answerCounts.reduce((summary, c) => {
    const count = parseInt(c.count);
    summary.total = count + summary.total;
    summary[c.response] = summary[c.response] ? count + summary[c.response] : count;
    return summary;
  }, {
    'total': 0
  });

  return summary;
}
