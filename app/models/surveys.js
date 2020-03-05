import db from '../services/db';
import { getQuestionsLatest } from './questions';

export async function createSurvey (data) {
  const {
    name,
    ownerId,
    optionalQuestions,
    mandatoryQuestions
  } = data;

  const id = await db('surveys').insert({
    name,
    ownerId,
    optionalQuestions,
    mandatoryQuestions
  }, 'id');

  return id;
}

export async function getSurvey (id) {
  const survey = await db('surveys').select()
    .where('id', '=', id)
    .first();

  if (survey.optionalQuestions) {
    const optionalQuestions = await getQuestionsLatest(survey.optionalQuestions);
    survey.optionalQuestions = optionalQuestions;
  }

  if (survey.mandatoryQuestions) {
    const mandatoryQuestions = await getQuestionsLatest(survey.mandatoryQuestions);
    survey.mandatoryQuestions = mandatoryQuestions;
  }
  return survey;
}
