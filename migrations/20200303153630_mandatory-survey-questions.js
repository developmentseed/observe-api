
exports.up = function (knex) {
  return knex.schema.alterTable('surveys', function (table) {
    table.renameColumn('questions', 'optionalQuestions');
    table.specificType('mandatoryQuestions', 'INT[]');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('surveys', function (table) {
    table.renameColumn('optionalQuestions', 'questions');
    table.dropColumn('mandatoryQuestions');
  });
};
