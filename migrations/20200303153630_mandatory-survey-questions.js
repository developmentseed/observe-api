
exports.up = function (knex) {
  return knex.schema.alterTable('surveys', function (table) {
    table.renameColumn('questions', 'optional_questions');
    table.specificType('mandatory_questions', 'INT[]');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('surveys', function (table) {
    table.renameColumn('optional_questions', 'questions');
    table.dropColumn('mandatory_questions');
  });
};
