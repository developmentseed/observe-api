exports.up = function (knex) {
  return knex.schema.table('surveys', function (t) {
    t.renameColumn('mandatoryQuestions', 'questions');
  });
};

exports.down = function (knex) {
  return knex.schema.table('surveys', function (t) {
    t.renameColumn('questions', 'mandatoryQuestions');
  });
};
