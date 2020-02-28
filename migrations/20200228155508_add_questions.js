
exports.up = function (knex) {
  return knex.schema.createTable('questions', function (table) {
    table.increments('id').primary();
    table.integer('versionId');
    table.foreign('versionId').references('question_versions.id');
    table.string('label');
    table.enum('type', ['boolen', 'multiple_choice', 'range', 'text', 'date', 'timestamp']);
    table.jsonb('options');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('questions');
};
