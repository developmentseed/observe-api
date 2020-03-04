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
  let question = null;
  if (version === 'latest') {
    question = await db('questions')
      .select('id', 'version', 'createdAt', 'label', 'type', 'options')
      .where('id', id)
      .orderBy('version', 'desc')
      .first();
  } else {
    question = await db('questions')
      .select()
      .where('id', id)
      .andWhere('version', version)
      .first();
  }
  return question;
}

export async function getQuestionsLatest (ids) {
  const questions = await db.raw('WITH latest_version AS (SELECT id, MAX(version) as version FROM questions WHERE id IN (??) GROUP BY id) SELECT latest_version.id, latest_version.version, questions."createdAt", questions.label, questions.type, questions.options from latest_version INNER JOIN questions ON questions.id=latest_version.id AND questions.version=latest_version.version;', [ids]);

  return questions.rows;
}

export async function updateQuestion (data) {
  const {
    id,
    version,
    label,
    type,
    options
  } = data;

  const response = await db('questions').insert({
    id,
    version,
    label,
    type,
    options
  }, ['id']);

  return getQuestion(response[0].id, version);
}
