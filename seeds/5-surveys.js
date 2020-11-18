// Enable ECMAScript module loader
require = require('esm')(module); // eslint-disable-line

const db = require('../app/services/db');

exports.seed = async function(knex) {
  const { count } = await db('surveys')
    .count()
    .first();
  if (count > 0) {
    // eslint-disable-next-line
    console.log('There are SURVEYS in the database already, bypass seeding...');
    return;
  }

  console.log('Seeding surveys...'); // eslint-disable-line

  const adminId = (await db('users')
    .select('id')
    .where({ isAdmin: true })
    .limit(1))[0].id;

  await db.raw('ALTER SEQUENCE surveys_id_seq RESTART WITH 1');

  await db('surveys').insert({
    name: 'Survey packaging provided by businesses:',
    questions: [1, 2],
    optionalQuestions: [2],
    ownerId: adminId
  });
};
