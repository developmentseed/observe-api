// Enable ECMAScript module loader
require = require('esm')(module); // eslint-disable-line

const db = require('../app/services/db');

exports.seed = async function(knex) {
  const { count } = await db('questions')
    .count()
    .first();
  if (count > 0) {
    // eslint-disable-next-line
    console.log(
      'There are QUESTIONS in the database already, bypass seeding...'
    );
    return;
  }

  console.log('Seeding questions...'); // eslint-disable-line

  await db.raw('ALTER SEQUENCE questions_id_seq RESTART WITH 1');

  await db('questions').insert({
    version: 1,
    label: 'Does this venue offer the option to purchase a plastic-free meal?',
    type: 'boolean',
    options: {
      no: 'No',
      yes: 'Yes'
    }
  });

  await db('questions').insert({
    version: 1,
    label: 'Please describe packaging provided:',
    type: 'text'
  });
};
