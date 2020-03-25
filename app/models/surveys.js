import db from '../services/db';
import { getQuestionsLatest } from './questions';

export async function createSurvey (data) {
  const { name, ownerId, optionalQuestions, questions } = data;

  const [id] = await db('surveys').insert(
    {
      name,
      ownerId,
      optionalQuestions,
      questions
    },
    'id'
  );

  return id;
}

async function populateQuestions (survey) {
  // Get latest question versions
  survey.questions = await getQuestionsLatest(survey.questions);

  // Flag optional questions
  survey.questions = survey.questions.map(q => {
    q.optional = survey.optionalQuestions.indexOf(q.id) > -1;
    return q;
  });

  return survey;
}

export async function getSurvey (id) {
  const survey = await db('surveys')
    .select()
    .where('id', '=', id)
    .first();

  return populateQuestions(survey);
}

export async function getSurveys () {
  const surveys = await db('surveys')
    .select()
    .map(populateQuestions);

  return surveys;
}
