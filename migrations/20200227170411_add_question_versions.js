
exports.up = function (knex) {
  return knex.schema.createTable('question_versions', function (table) {
    table.increments('id').primary();
    table.integer('questionId');
    table.integer('version');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('question_versions');
};
